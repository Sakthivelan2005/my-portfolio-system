class AudioEngine {
  context: AudioContext | null = null;
  buffers: Map<string, AudioBuffer> = new Map();
  
  // Track active sounds so we can update volume live or stop them
  activeNodes: Map<string, { source: AudioBufferSourceNode; gain: GainNode }> = new Map();

  init() {
    if (!this.context) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new AudioCtx();
    }
    // Resume context if it was locked by browser auto-play policies
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  async load(name: string, url: string) {
    if (this.buffers.has(name)) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (!this.context) this.init();
      
      const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load audio: ${name}`, error);
    }
  }

  play(name: string, options: { volume?: number; loop?: boolean } = {}) {
    this.init();
    const buffer = this.buffers.get(name);
    if (!buffer || !this.context) return;

    // Stop any existing instance of this sound before playing a new one
    this.stop(name);

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = buffer;
    source.loop = options.loop || false;
    gainNode.gain.value = options.volume ?? 1.0;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);

    this.activeNodes.set(name, { source, gain: gainNode });

    // Cleanup memory when the sound finishes naturally
    source.onended = () => {
      if (this.activeNodes.get(name)?.source === source) {
        this.activeNodes.delete(name);
      }
    };
  }

  stop(name: string) {
    const node = this.activeNodes.get(name);
    if (node) {
      try { node.source.stop(); } catch { /* Ignore InvalidStateError */ }
      this.activeNodes.delete(name);
    }
  }

  setVolume(name: string, volume: number) {
    const node = this.activeNodes.get(name);
    if (node) {
      // O(1) instant volume update for 60fps physics calls
      node.gain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

export const audioPool = new AudioEngine();