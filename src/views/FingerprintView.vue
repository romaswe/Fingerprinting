<template>
  <div class="fingerprintContainer">
    <h1>Your fingerprint is: {{ fingerprint }}</h1>
  </div>
</template>

<script lang="ts">
import type { Fingerprint } from '@/data/fingerprintInterface'
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      fingerprint: '',
      usingWebGL: true
    }
  },
  methods: {},
  created() {
    console.log('weeehaaa')
    const fingerprint: Promise<Fingerprint> = generateFingerprint() // Outputs a unique hash for the user's browser and device including WebGL and/or canvas fingerprints
    console.log(fingerprint)

    fingerprint.then((fp) => {
      if (fp.fingerprintHash) {
        fp.fingerprintHash.then((fpH) => {
          this.fingerprint = fpH
        })
      }
    })
  }
})

async function generateFingerprint(): Promise<Fingerprint> {
  // Collect browser and device information
  const userAgent: string = navigator.userAgent
  const language: string = navigator.language
  const platform: string = navigator.platform
  const plugins: string = Array.from(navigator.plugins, (plugin) => plugin.name).join(',')
  const screenResolution: string = `${window.screen.width}x${window.screen.height}`

  // Generate a hash of the collected information
  const fingerprint: string = `${userAgent}${language}${platform}${plugins}${screenResolution}`
  const hashedInfoFingerprint: Promise<string> = sha256(fingerprint)
  console.log('browser+device fingerprint: ' + (await hashedInfoFingerprint))

  // Try WebGL fingerprinting
  let usingWebGL = true
  let hashedWebglFingerprint: Promise<string> | undefined
  const canvasWebGL: HTMLCanvasElement = document.createElement('canvas')
  const gl: WebGLRenderingContext | null = canvasWebGL.getContext('webgl')
  if (gl) {
    // eslint-disable-next-line no-undef
    const debugInfo: WEBGL_debug_renderer_info | null = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer: string = gl.getParameter(debugInfo!.UNMASKED_RENDERER_WEBGL) as string
    hashedWebglFingerprint = sha256(renderer)
    console.log('WebGL fingerprint: ' + (await hashedWebglFingerprint))
  }

  // If WebGL fingerprinting fails, use canvas fingerprinting
  if (!hashedWebglFingerprint) {
    usingWebGL = false
    const canvasCanvas: HTMLCanvasElement = document.createElement('canvas')
    const context: CanvasRenderingContext2D | null = canvasCanvas.getContext('2d')
    if (context) {
      const text: string = 'Canvas fingerprint'
      context.textBaseline = 'top'
      context.font = '14px "Arial"'
      context.textBaseline = 'alphabetic'
      context.fillStyle = '#f60'
      context.fillRect(125, 1, 62, 20)
      context.fillStyle = '#069'
      context.fillText(text, 2, 15)
      context.fillStyle = 'rgba(102, 204, 0, 0.7)'
      context.fillText(text, 4, 17)
      const canvasFingerprint: string = canvasCanvas.toDataURL()
      hashedWebglFingerprint = sha256(canvasFingerprint)
      console.log('canvas fingerprint: ' + (await hashedWebglFingerprint))
    }
  }

  // Combine the hashed browser and device information and WebGL fingerprint
  let returnObj: Fingerprint = {
    fingerprintHash: Promise.all([hashedInfoFingerprint, hashedWebglFingerprint]).then((data) =>
      data[1] ? data[0] + data[1] : data[0]
    ),
    hashedInfoFingerprint: hashedInfoFingerprint.then((hashedInfo) => hashedInfo),
    hashedWebglFingerprint: hashedWebglFingerprint?.then((hashedWeb) => hashedWeb) ?? undefined,
    usingWebGL: usingWebGL
  }
  return returnObj
}

function sha256(input: string): Promise<string> {
  // Hash the input using SHA-256 algorithm
  const encoder: TextEncoder = new TextEncoder()
  const data: Uint8Array = encoder.encode(input)
  return crypto.subtle.digest('SHA-256', data).then((buffer) => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  })
}
</script>
