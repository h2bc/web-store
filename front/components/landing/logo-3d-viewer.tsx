'use client'

import { useEffect } from 'react'

const MODEL_ASSET_PATH = '/h2bc_3d_logo.glb'

export default function Logo3DViewer() {
  useEffect(() => {
    void import('@google/model-viewer')
  }, [])

  return (
    <div className="aspect-square w-56 sm:w-64 md:w-80">
      {/* @ts-expect-error: model-viewer is a custom element */}
      <model-viewer
        src={MODEL_ASSET_PATH}
        camera-controls
        disable-zoom
        disable-pan
        interaction-prompt="none"
        auto-rotate
        auto-rotate-speed="500"
        class="block w-full h-full"
      />
    </div>
  )
}
