const BGM_PREFIX = 'https://cdn.jsdelivr.net/gh/CATS0600/Warehouse@main/MUJI50/';
const STORAGE_KEY = 'CrepusVilla-BGM-State';

export interface BgmTrack {
  id: number;
  title: string;
  fileName: string;
  url: string;
}

interface BgmState {
  currentTrackId: number;
  currentTime: number;
  isPlaying: boolean;
  mode: 'list' | 'random';
  randomQueue: number[];
  queueIndex: number;
}

const TRACK_NAMES = [
  'MUJI BGM - A Tazza\'e cafe.mp3',
  'MUJI BGM - A vucchella.mp3',
  'MUJI BGM - Alastair m’ansachd.mp3',
  'MUJI BGM - Borboleta Bonitinha.mp3',
  'MUJI BGM - Calunga.mp3',
  'MUJI BGM - Caranguejo.mp3',
  'MUJI BGM - Controdanza.mp3',
  'MUJI BGM - Daar was een sneeuwwit vogeltje.mp3',
  'MUJI BGM - De Ijswals.mp3',
  'MUJI BGM - De Reus.mp3',
  'MUJI BGM - Duas Cirandas.mp3',
  'MUJI BGM - Excentrique.mp3',
  'MUJI BGM - Faoileagan Sgarba  Maddainn chiuin chéitein  Alasdair sunndach, run nan caileagan.mp3',
  'MUJI BGM - Gammal Halling.mp3',
  'MUJI BGM - G’Lyck den grootsten rapsack.mp3',
  'MUJI BGM - Het Weesmeisje.mp3',
  'MUJI BGM - Ik ging op enen morgen.mp3',
  'MUJI BGM - Jos sä olet minun hellunani.mp3',
  'MUJI BGM - Kengo-Antas Vals.mp3',
  'MUJI BGM - Kirkonkellot.mp3',
  'MUJI BGM - Kouon Frouva.mp3',
  'MUJI BGM - Les Deux Guitares.mp3',
  'MUJI BGM - Maria Mari.mp3',
  'MUJI BGM - Mrs Robertson of Grishornish  Cawdor Fair  The Night we had the goats.mp3',
  'MUJI BGM - Musette.mp3',
  'MUJI BGM - N\'Lars Och N\'Mas.mp3',
  'MUJI BGM - O X do Problema.mp3',
  'MUJI BGM - Paimensoitto.mp3',
  'MUJI BGM - Pikkulukkarin sotiisi.mp3',
  'MUJI BGM - Polska Efter Per Jonas Lång.mp3',
  'MUJI BGM - Pääskyläinen.mp3',
  'MUJI BGM - Rapaz Folgado.mp3',
  'MUJI BGM - Ratho Fair  Pretty Peggy.mp3',
  'MUJI BGM - Reginella.mp3',
  'MUJI BGM - Sapo Cururu.mp3',
  'MUJI BGM - Schoon dat ik onder t\'groen.mp3',
  'MUJI BGM - Schottis Från Indal.mp3',
  'MUJI BGM - Snachts rusten meest de dieren.mp3',
  'MUJI BGM - Soraidh slàn le Fionnairidh.mp3',
  'MUJI BGM - Spelman Satt Vid Vaggan.mp3',
  'MUJI BGM - Spoof 49.mp3',
  'MUJI BGM - Sut kun mun silmäni.mp3',
  'MUJI BGM - Te Voglio Bene Assaje.mp3',
  'MUJI BGM - Tehtaan tyttö.mp3',
  'MUJI BGM - The Bonawe Highlanders  Whist we live, let us live.mp3',
  'MUJI BGM - The price of a pig  The favourite dram.mp3',
  'MUJI BGM - Torna a Surriento.mp3',
  'MUJI BGM - Tá Caindo Flor.mp3',
  'MUJI BGM - último Desejo.mp3',
];

export const getBgmPlaylist = (): BgmTrack[] =>
  TRACK_NAMES.map((fileName, index) => ({
    id: index,
    title: fileName.replace(/\.mp3$/i, ''),
    fileName,
    url: `${BGM_PREFIX}${encodeURIComponent(fileName)}`,
  }));

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class BgmController {
  private static _instance: BgmController | null = null;
  public playlist: BgmTrack[];
  public audio: HTMLAudioElement | null = null;
  public nextAudio: HTMLAudioElement | null = null;
  public currentTrackId = 0;
  public isPlaying = false;
  public mode: 'list' | 'random' = 'random';
  private queueIndex = 0;
  private randomQueue: number[] = [];
  private restoreCalled = false;
  private persistTimer: number | null = null;
  private targetVolume = 0.3;
  private pendingAutoplay = false;
  private dispatchEvent(eventType: string) {
    window.dispatchEvent(new CustomEvent('bgm-' + eventType, { detail: { controller: this } }));
  }

  private fadeInVolume(targetVolume: number = 0.3) {
    if (!this.audio) return;
    this.audio.volume = 0;
    const duration = 1500; // 1.5s
    const steps = 60; // 60fps
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fade = () => {
      currentStep++;
      this.audio!.volume = Math.min(volumeStep * currentStep, targetVolume);
      if (currentStep < steps) {
        requestAnimationFrame(fade);
      }
    };
    requestAnimationFrame(fade);
  }

  private constructor() {
    this.playlist = TRACK_NAMES.map((fileName, index) => ({
      id: index,
      title: fileName.replace(/\.mp3$/i, ''),
      fileName,
      url: `${BGM_PREFIX}${encodeURIComponent(fileName)}`,
    }));

    this.randomQueue = this.buildRandomQueue();
  }

  public static getInstance(): BgmController {
    if (!BgmController._instance) {
      BgmController._instance = new BgmController();
    }
    return BgmController._instance;
  }

  public init(options?: { autoplay?: boolean; volume?: number }) {
    if (this.restoreCalled) {
      return;
    }
    this.restoreCalled = true;

    // 延迟创建 Audio 对象，确保在客户端运行
    if (typeof window !== 'undefined' && !this.audio) {
      this.audio = this.createAudioElement();
      this.audio.addEventListener('ended', () => this.handleTrackEnded());
      this.audio.addEventListener('timeupdate', () => this.handleTimeUpdate());
      this.audio.addEventListener('pause', () => { this.isPlaying = false; this.persistState(); });
      this.audio.addEventListener('play', () => { this.isPlaying = true; this.persistState(); });
    }

    if (options?.volume !== undefined && this.audio) {
        const v = Math.min(Math.max(options.volume, 0), 1);
        this.audio.volume = v;
        this.targetVolume = v; // 确保同步
    }

    if (options?.autoplay) {
      this.pendingAutoplay = true;
    }

    const stored = this.loadState();
    if (stored) {
      this.applyState(stored);
    } else {
      this.currentTrackId = this.randomQueue[0] ?? 0;
      this.queueIndex = 0;
      this.setActiveTrack(this.currentTrackId);
    }

    if (options?.autoplay && this.audio && this.audio.paused) {
      void this.audio.play().catch(() => {
        // 浏览器自动播放可能被阻止，用户交互后再播放
      });
    }

    this.preloadNextTrack();
  }

  public togglePlay() {
    if (!this.audio) return;
    if (this.audio.paused) {
      return this.play();
    }
    return this.pause();
  }

  public play() {
    if (!this.audio) return;
    this.isPlaying = true;
    if (!this.audio.src) {
      this.setActiveTrack(this.currentTrackId);
    }
    // 音量淡入，从0开始
    this.fadeInVolume(this.targetVolume);
    void this.audio.play().catch(() => {
      // 自动播放可能被阻止
    });
    this.persistState();
    this.dispatchEvent('play');
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
    this.persistState();
    this.dispatchEvent('pause');
  }

  public next(forcePlay: boolean = false) {
    if (this.mode === 'list') {
      this.currentTrackId = (this.currentTrackId + 1) % this.playlist.length;
    } else {
      this.queueIndex += 1;
      if (this.queueIndex >= this.randomQueue.length) {
        this.randomQueue = this.buildRandomQueue();
        this.queueIndex = 0;
      }
      this.currentTrackId = this.randomQueue[this.queueIndex];
    }
    this.setActiveTrack(this.currentTrackId, 0, forcePlay || this.isPlaying);
  }

  public previous() {
    this.queueIndex -= 1;
    if (this.queueIndex < 0) {
      this.randomQueue = this.buildRandomQueue();
      this.queueIndex = this.randomQueue.length - 1;
    }
    this.currentTrackId = this.randomQueue[this.queueIndex];
    this.setActiveTrack(this.currentTrackId, 0, this.isPlaying);
  }

  public playTrack(trackId: number) {
    this.setActiveTrack(trackId, 0, true);
  }

  public restoreStateOnPageSwap() {
    const stored = this.loadState();
    if (!stored || !this.audio) {
      return;
    }
    this.applyState(stored);
    if (stored.isPlaying) {
      setTimeout(() => {
        this.audio!.currentTime = stored.currentTime;
        this.fadeInVolume(this.targetVolume);
        void this.audio!.play().catch(() => {
          // 可能受浏览器策略限制
        });
      }, 1000);
    }
  }

  private applyState(state: BgmState) {
    this.mode = state.mode || 'random';
    if (this.mode === 'random') {
      if (!this.isValidQueue(state.randomQueue)) {
        state.randomQueue = this.buildRandomQueue();
        state.queueIndex = state.randomQueue.indexOf(state.currentTrackId);
      }
      this.randomQueue = state.randomQueue;
      this.queueIndex = this.clampIndex(state.queueIndex, this.randomQueue.length);
    }
    this.currentTrackId = this.clampIndex(state.currentTrackId, this.playlist.length);

    if (!this.audio) return;

    const track = this.playlist[this.currentTrackId];
    this.audio.src = track.url;
    this.audio.currentTime = Math.max(0, Math.min(state.currentTime, this.audio.duration || state.currentTime));
    this.isPlaying = state.isPlaying;
    this.persistState();
    this.preloadNextTrack();
  }

  private buildRandomQueue(): number[] {
    const ids = this.playlist.map((track) => track.id);
    return shuffleArray(ids);
  }

  private isValidQueue(queue: unknown): queue is number[] {
    return Array.isArray(queue) && queue.length === this.playlist.length && queue.every((value) => typeof value === 'number' && value >= 0 && value < this.playlist.length);
  }

  private clampIndex(index: number, length: number) {
    if (Number.isNaN(index) || !Number.isFinite(index)) {
      return 0;
    }
    return Math.min(Math.max(Math.floor(index), 0), Math.max(length - 1, 0));
  }

  private setActiveTrack(trackId: number, startTime = 0, autoPlay = false) {
    this.currentTrackId = this.clampIndex(trackId, this.playlist.length);
    this.queueIndex = this.randomQueue.indexOf(this.currentTrackId);
    if (this.queueIndex < 0) {
      this.randomQueue = this.buildRandomQueue();
      this.queueIndex = this.randomQueue.indexOf(this.currentTrackId);
    }

    if (!this.audio) return;

    const track = this.playlist[this.currentTrackId];
    this.audio.src = track.url;
    this.audio.currentTime = Math.max(0, startTime);

    if (autoPlay) {
      if (this.isPlaying) {
        this.fadeInVolume(this.targetVolume);
      }
      void this.audio.play().catch(() => {
        this.isPlaying = false;
      });
    }

    this.persistState();
    this.preloadNextTrack();
  }

  private preloadNextTrack() {
    const nextId = this.getNextTrackId();
    if (nextId === null) {
      return;
    }
    const nextUrl = this.playlist[nextId].url;
    if (!this.nextAudio) {
      this.nextAudio = new Audio();
      this.nextAudio.preload = 'auto';
      this.nextAudio.crossOrigin = 'anonymous';
    }
    if (this.nextAudio.src !== nextUrl) {
      this.nextAudio.src = nextUrl;
    }
  }

  private getNextTrackId(): number | null {
    if (this.randomQueue.length === 0) {
      return null;
    }
    const nextIndex = this.queueIndex + 1;
    if (nextIndex < this.randomQueue.length) {
      return this.randomQueue[nextIndex];
    }
    return this.randomQueue[0];
  }

  private handleTrackEnded() {
    this.isPlaying = false;
    this.persistState();
    this.next(true); // 强制播放下一首
    this.dispatchEvent('trackEnded');
  }

  private handleTimeUpdate() {
    if (this.persistTimer !== null || typeof window === 'undefined') {
      return;
    }
    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = null;
      this.persistState();
    }, 1000);
  }

  private createAudioElement() {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.addEventListener('canplaythrough', () => {
      if (this.pendingAutoplay) {
        this.pendingAutoplay = false;
        this.play();
      }
    });
    return audio;
  }

  private loadState(): BgmState | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as BgmState;
      if (typeof parsed.currentTrackId !== 'number' || typeof parsed.currentTime !== 'number' || typeof parsed.isPlaying !== 'boolean') {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private persistState() {
    if (!this.audio || typeof sessionStorage === 'undefined') {
      return;
    }
    const state: BgmState = {
      currentTrackId: this.currentTrackId,
      currentTime: Math.max(0, Math.min(this.audio.currentTime || 0, this.audio.duration || Infinity)),
      isPlaying: this.isPlaying,
      mode: this.mode,
      randomQueue: this.randomQueue,
      queueIndex: this.queueIndex,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export const bgmController = BgmController.getInstance();
