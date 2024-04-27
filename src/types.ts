import { EventHandler } from '@create-figma-plugin/utilities'

export interface ImportGCSFileHandler extends EventHandler {
  name: 'IMPORT_GCS_FILE'
  handler: (data: any) => void
}

export interface SwatchesCreatedEvent extends EventHandler {
  name: 'SWATCHES_CREATED'
  handler: () => void
}

export interface ClosePluginEvent extends EventHandler {
  name: 'CLOSE_PLUGIN'
  handler: () => void
}

export interface CreateSwatchesEvent extends EventHandler {
  name: 'CREATE_SWATCHES'
  handler: (msg: any , optimization: any) => void
}