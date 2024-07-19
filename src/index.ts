import axios, { AxiosInstance, AxiosResponse } from "axios"
import winston, { Logger } from "winston"
import FormData from "form-data"

/**
 * Custom error class for VOE API related errors
 * @extends Error
 */
class VOEError extends Error {
  code: string
  response?: AxiosResponse

  /**
   * Create a VOEAPIError
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {AxiosResponse} [response] - Axios response object
   */
  constructor(message: string, code: string, response?: AxiosResponse) {
    super(message)
    this.name = "VOEAPIError"
    this.code = code
    this.response = response
  }
}

/**
 * VOEAPI class for interacting with the VOE API
 */
class VOE {
  private apiKey: string
  private baseURL: string = "https://voe.sx/api"
  private client: AxiosInstance
  private logger: Logger

  /**
   * Create a VOEAPI instance
   * @param {string} apiKey - Your VOE API key
   * @param {Object} [options] - Additional options
   * @param {Logger} [options.logger] - Custom logger (must implement info, warn, and error methods)
   */
  constructor(apiKey: string, options: { logger?: Logger } = {}) {
    if (!apiKey) {
      throw new VOEError("API key is required", "MISSING_API_KEY")
    }

    this.apiKey = apiKey
    this.client = axios.create({
      baseURL: this.baseURL,
      params: { key: this.apiKey },
    })

    this.logger =
      options.logger ||
      winston.createLogger({
        level: "info",
        format: winston.format.simple(),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: "voe-api.log" }),
        ],
      })

    // Add request interceptor for logging
    this.client.interceptors.request.use((config) => {
      this.logger.info(`Request: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    })

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        this.logger.info(`Response: ${response.status} ${response.statusText}`)
        return response
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `API Error: ${error.response.status} ${error.response.statusText}`,
          )
          throw new VOEError(
            error.response.data.message || "API request failed",
            "API_ERROR",
            error.response,
          )
        } else if (error.request) {
          this.logger.error("Network Error: No response received")
          throw new VOEError("Network error", "NETWORK_ERROR")
        } else {
          this.logger.error(`Request Error: ${error.message}`)
          throw new VOEError(error.message, "REQUEST_ERROR")
        }
      },
    )
  }

  /**
   * Get account information
   * @returns {Promise<Object>} Account information
   */
  async getAccountInfo(): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/account/info"),
    )
  }

  /**
   * Get account statistics
   * @returns {Promise<Object>} Account statistics
   */
  async getAccountStats(): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/account/stats"),
    )
  }

  /**
   * Get upload server URL
   * @returns {Promise<string>} Upload server URL
   */
  async getUploadServer(): Promise<string> {
    const data = await this.requestWithErrorHandling<{ result: string }>(() =>
      this.client.get("/upload/server"),
    )
    return data.result
  }

  /**
   * Upload a file to VOE
   * @param {string} uploadServer - Upload server URL
   * @param {Buffer|Blob|File} file - File to upload
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(
    uploadServer: string,
    file: Buffer | Blob | File,
  ): Promise<any> {
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await axios.post(uploadServer, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return response.data
    } catch (error) {
      this.logger.error("Failed to upload file", error)
      throw error
    }
  }

  /**
   * Initiate a remote upload
   * @param {string} url - URL of the file to upload
   * @returns {Promise<Object>} Remote upload result
   */
  async remoteUpload(url: string): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/upload/url", { params: { url } }),
    )
  }

  /**
   * Get list of remote uploads
   * @param {number} [id] - ID of specific remote upload
   * @returns {Promise<Object>} List of remote uploads
   */
  async getRemoteUploadList(id: number | null = null): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/upload/url/list", {
        params: { id },
      }),
    )
  }

  /**
   * Clone an existing upload
   * @param {string} fileCode - File code to clone
   * @param {number} [folderId=0] - Folder ID to place the cloned file
   * @returns {Promise<Object>} Clone result
   */
  async cloneUpload(fileCode: string, folderId: number = 0): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/file/clone", {
        params: { file_code: fileCode, fld_id: folderId },
      }),
    )
  }

  /**
   * Get file information
   * @param {string} fileCodes - Comma-separated list of file codes
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(fileCodes: string): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/file/info", {
        params: { file_code: fileCodes },
      }),
    )
  }

  /**
   * List files
   * @param {Object} [options] - Listing options
   * @param {number} [options.page] - Page number
   * @param {number} [options.per_page] - Number of results per page
   * @param {number} [options.fld_id] - Folder ID
   * @param {string} [options.created] - Filter by creation date
   * @param {string} [options.name] - Filter by file name
   * @returns {Promise<Object>} List of files
   */
  async listFiles(
    options: {
      page?: number
      per_page?: number
      fld_id?: number
      created?: string
      name?: string
    } = {},
  ): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/file/list", { params: options }),
    )
  }

  /**
   * Rename a file
   * @param {string} fileCode - File code
   * @param {string} title - New file title
   * @returns {Promise<Object>} Rename result
   */
  async renameFile(fileCode: string, title: string): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/file/rename", {
        params: { file_code: fileCode, title },
      }),
    )
  }

  /**
   * Move a file to a folder
   * @param {string} fileCode - File code
   * @param {number} folderId - Destination folder ID
   * @returns {Promise<Object>} Move result
   */
  async moveFile(fileCode: string, folderId: number): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/file/move", {
        params: { file_code: fileCode, fld_id: folderId },
      }),
    )
  }

  /**
   * Delete a file
   * @param {string} fileCode - File code
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(fileCode: string): Promise<any> {
    return this.requestWithErrorHandling<any>(() =>
      this.client.get("/file/delete", {
        params: { file_code: fileCode },
      }),
    )
  }

  /**
   * Request handler with error logging
   * @private
   * @param {Function} requestFn - Function that makes the request
   * @returns {Promise<any>} Request result
   */
  private async requestWithErrorHandling<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
  ): Promise<T> {
    try {
      const response = await requestFn()
      return response.data
    } catch (error: any) {
      if (error.response) {
        this.logger.error(
          `API Error: ${error.response.status} ${error.response.statusText}`,
          error.response.data,
        )
        throw new VOEError(
          error.response.data.message || "API request failed",
          "API_ERROR",
          error.response,
        )
      } else if (error.request) {
        this.logger.error("Network Error: No response received")
        throw new VOEError("Network error", "NETWORK_ERROR")
      } else {
        this.logger.error(`Request Error: ${error.message}`)
        throw new VOEError(error.message, "REQUEST_ERROR")
      }
    }
  }
}

export { VOE, VOEError }
