import { MonzoRequest } from './api'
import { Json } from './helpers'

export class Attachment {
  constructor(private readonly att: MonzoAttachmentResponse) {}

  get created() {
    return this.att.created
  }

  get txId() {
    return this.att.external_id
  }

  get id() {
    return this.att.id
  }

  get type() {
    return this.att.file_type
  }

  get url() {
    return this.att.url
  }

  get userId() {
    return this.att.user_id
  }

  selfDeregisterRequest(): MonzoRequest {
    return {
      path: '/attachment/deregister',
      body: {
        id: this.id
      },
      method: 'POST'
    }
  }

  get json(): MonzoAttachmentResponse {
    return this.att
  }

  get stringify(): string {
    return JSON.stringify(this.json)
  }
}

export interface MonzoAttachmentResponse extends Record<string, Json> {
  created: string
  external_id: string
  // TODO: full mime-type list
  file_type: string
  file_url: string
  id: string
  type: string
  url: string
  user_id: string
}

export interface MonzoAttachmentOuterResponse extends Record<string, Json> {
  attachment: MonzoAttachmentResponse
}

export interface MonzoAttachmentUploadResponse extends Record<string, Json> {
  file_url: string
  upload_url: string
}
