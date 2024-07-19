import { AxiosResponse } from "axios"
import { Logger } from "winston"

export class VOEError extends Error {
  code: string
  response?: AxiosResponse
  constructor(message: string, code: string, response?: AxiosResponse)
}

export class VOEAPI {
  constructor(apiKey: string, options?: { logger?: Logger })

  getAccountInfo(): Promise<any>
  getAccountStats(): Promise<any>
  getUploadServer(): Promise<string>
  uploadFile(uploadServer: string, file: Buffer | Blob | File): Promise<any>
  remoteUpload(url: string): Promise<any>
  getRemoteUploadList(id?: number | null): Promise<any>
  cloneUpload(fileCode: string, folderId?: number): Promise<any>
  getFileInfo(fileCodes: string): Promise<any>
  listFiles(options?: {
    page?: number
    per_page?: number
    fld_id?: number
    created?: string
    name?: string
  }): Promise<any>
  renameFile(fileCode: string, title: string): Promise<any>
  moveFile(fileCode: string, folderId: number): Promise<any>
  deleteFile(fileCode: string): Promise<any>
}
