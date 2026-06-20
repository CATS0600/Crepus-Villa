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
  'MUJI BGM - A Tazza\'e cafe.mp3', 'MUJI BGM - A vucchella.mp3', 'MUJI BGM - Alastair m’ansachd.mp3',
  'MUJI BGM - Borboleta Bonitinha.mp3', 'MUJI BGM - Calunga.mp3', 'MUJI BGM - Caranguejo.mp3',
  'MUJI BGM - Controdanza.mp3', 'MUJI BGM - Daar was een sneeuwwit vogeltje.mp3', 'MUJI BGM - De Ijswals.mp3',
  'MUJI BGM - De Reus.mp3', 'MUJI BGM - Duas Cirandas.mp3', 'MUJI BGM - Excentrique.mp3',
  'MUJI BGM - Faoileagan Sgarba  Maddainn chiuin chéitein  Alasdair sunndach, run nan caileagan.mp3',
  'MUJI BGM - Gammal Halling.mp3', 'MUJI BGM - G’Lyck den grootsten rapsack.mp3', 'MUJI BGM - Het Weesmeisje.mp3',
  'MUJI BGM - Ik ging op enen morgen.mp3', 'MUJI BGM - Jos sä olet minun hellunani.mp3', 'MUJI BGM - Kengo-Antas Vals.mp3',
  'MUJI BGM - Kirkonkellot.mp3', 'MUJI BGM - Kouon Frouva.mp3', 'MUJI BGM - Les Deux Guitares.mp3',
  'MUJI BGM - Maria Mari.mp3', 'MUJI BGM - Mrs Robertson of Grishornish  Cawdor Fair  The Night we had the goats.mp3',
  'MUJI BGM - Musette.mp3', 'MUJI BGM - N\'Lars Och N\'Mas.mp3', 'MUJI BGM - O X do Problema.mp3',
  'MUJI BGM - Paimensoitto.mp3', 'MUJI BGM - Pikkulukkarin sotiisi.mp3', 'MUJI BGM - Polska Efter Per Jonas Lång.mp3',
  'MUJI BGM - Pääskyläinen.mp3', 'MUJI BGM - Rapaz Folgado.mp3', 'MUJI BGM - Ratho Fair  Pretty Peggy.mp3',
  'MUJI BGM - Reginella.mp3', 'MUJI BGM - Sapo Cururu.mp3', 'MUJI BGM - Schoon dat ik onder t\'groen.mp3',
  'MUJI BGM - Schottis Från Indal.mp3', 'MUJI BGM - Snachts rusten meest de dieren.mp3', 'MUJI BGM - Soraidh slàn le Fionnairidh.mp3',
  'MUJI BGM - Spelman Satt Vid Vaggan.mp3', 'MUJI BGM - Spoof 49.mp3', 'MUJI BGM - Sut kun mun silmäni.mp3',
  'MUJI BGM - Te Voglio Bene Assaje.mp3', 'MUJI BGM - Tehtaan tyttö.mp3', 'MUJI BGM - The Bonawe Highlanders  Whist we live, let us live.mp3',
  'MUJI BGM - The price of a pig  The favourite dram.mp3', 'MUJI BGM - Torna a Surriento.mp3', 'MUJI BGM - Tá Caindo Flor.mp3',
  'MUJI BGM - último Desejo.mp3',
];

export const getBgmPlaylist = (): BgmTrack[] =>
  TRACK_NAMES.map((fileName, index) => ({
    id: index,
    title: fileName.replace(/^MUJI BGM - /i, '').replace(/\.mp3$/i, ''),
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
  private fadeInterval: number | null = null;
  private pendingAutoplay = false;
  public isLoading = true;

  private constructor() {
    this.playlist = getBgmPlaylist();
    this.randomQueue = this.buildRandomQueue();
  }

  public static getInstance(): BgmController {
    if (!BgmController._instance) {
      BgmController._instance = new BgmController();
    }
    return BgmController._instance;
  }

  private dispatchEvent(eventType: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bgm-' + eventType, { detail: { controller: this } }));
    }
  }

  private fadeInVolume(target: number = 0.3) {
    if (!this.audio) return;
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    this.audio.volume = 0;
    const step = target / 30;
    this.fadeInterval = window.setInterval(() => {
      if (!this.audio) return;
      const nextVolume = this.audio.volume + step;
      if (nextVolume >= target) {
        this.audio.volume = target;
        clearInterval(this.fadeInterval!);
      } else {
        this.audio.volume = nextVolume;
      }
    }, 50);
  }

  public init(options?: { autoplay?: boolean; volume?: number }) {
    if (typeof window === 'undefined') return;

    if (options?.volume !== undefined) this.targetVolume = options.volume;

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      
      this.audio.addEventListener('ended', () => this.handleTrackEnded());
      this.audio.addEventListener('timeupdate', () => this.handleTimeUpdate());
      this.audio.addEventListener('canplaythrough', () => { this.isLoading = false; this.dispatchEvent('ready'); }, { once: true });
      this.audio.addEventListener('play', () => { this.isPlaying = true; this.dispatchEvent('play'); });
      this.audio.addEventListener('pause', () => { this.isPlaying = false; this.dispatchEvent('pause'); });
    }

    // 只有在第一次真正初始化时加载状态
    if (!this.restoreCalled) {
      this.restoreCalled = true;
      const stored = this.loadState();
      if (stored) {
        this.applyState(stored);
      } else {
        this.currentTrackId = this.randomQueue[0] ?? 0;
        this.queueIndex = 0;
        this.setActiveTrack(this.currentTrackId, 0, options?.autoplay);
      }
    }

    this.preloadNextTrack();
  }

  /**
   * 处理 Astro ViewTransitions 切换后的恢复
   */
  public restoreStateOnPageSwap() {
    if (!this.audio) return;
    
    if (this.pendingAutoplay || this.isPlaying) {
      setTimeout(() => {
        this.play()?.catch(() => {
          console.warn('BGM resume blocked after swap.');
          this.isPlaying = false;
          this.dispatchEvent('pause');
        });
      }, 100);
      this.pendingAutoplay = false;
    }
  }

  public togglePlay() {
    if (!this.audio) return;
    return this.audio.paused ? this.play() : this.pause();
  }

  public play() {
    if (!this.audio) return;
    if (!this.audio.src) this.setActiveTrack(this.currentTrackId);
    
    this.fadeInVolume(this.targetVolume);
    return this.audio.play().catch((err) => {
      console.warn('BGM Play blocked:', err);
    });
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.persistState();
  }

  public playTrack(trackId: number) {
    this.setActiveTrack(trackId, 0, true);
  }

  public next(forcePlay: boolean = false) {
    if (this.mode === 'list') {
      this.currentTrackId = (this.currentTrackId + 1) % this.playlist.length;
    } else {
      this.queueIndex = (this.queueIndex + 1) % this.randomQueue.length;
      if (this.queueIndex === 0) this.randomQueue = this.buildRandomQueue();
      this.currentTrackId = this.randomQueue[this.queueIndex];
    }
    this.setActiveTrack(this.currentTrackId, 0, forcePlay || this.isPlaying);
  }

  public setMode(mode: 'list' | 'random') {
    this.mode = mode;
    this.persistState();
  }

  private setActiveTrack(trackId: number, startTime = 0, autoPlay = false) {
    this.currentTrackId = this.clampIndex(trackId, this.playlist.length);
    this.queueIndex = this.randomQueue.indexOf(this.currentTrackId);

    if (!this.audio) return;

    const track = this.playlist[this.currentTrackId];
    if (this.audio.src !== track.url) {
      this.isLoading = true;
      this.dispatchEvent('loading');
      this.audio.src = track.url;
      this.audio.currentTime = startTime;
    }

    if (autoPlay) this.play();
    
    this.persistState();
    this.preloadNextTrack();
  }

  private preloadNextTrack() {
    const nextId = this.getNextTrackId();
    if (nextId === null) return;
    
    if (!this.nextAudio) {
      this.nextAudio = new Audio();
      this.nextAudio.preload = 'auto';
    }
    this.nextAudio.src = this.playlist[nextId].url;
  }

  private getNextTrackId(): number | null {
    if (this.mode === 'list') return (this.currentTrackId + 1) % this.playlist.length;
    const nextIdx = (this.queueIndex + 1) % this.randomQueue.length;
    return this.randomQueue[nextIdx];
  }

  private handleTrackEnded() {
    this.dispatchEvent('trackEnded');
    this.next(true);
  }

  private handleTimeUpdate() {
    if (this.persistTimer) return;
    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = null;
      this.persistState();
    }, 2000);
  }

  private loadState(): BgmState | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private applyState(state: BgmState) {
    this.mode = state.mode || 'random';
    this.currentTrackId = this.clampIndex(state.currentTrackId, this.playlist.length);
    this.randomQueue = this.isValidQueue(state.randomQueue) ? state.randomQueue : this.buildRandomQueue();
    this.queueIndex = this.randomQueue.indexOf(this.currentTrackId);

    if (this.audio) {
      this.audio.src = this.playlist[this.currentTrackId].url;
      this.audio.currentTime = state.currentTime;
      if (state.isPlaying) this.pendingAutoplay = true;
    }
  }

  private persistState() {
    if (!this.audio || typeof sessionStorage === 'undefined') return;
    const state: BgmState = {
      currentTrackId: this.currentTrackId,
      currentTime: this.audio.currentTime,
      isPlaying: !this.audio.paused,
      mode: this.mode,
      randomQueue: this.randomQueue,
      queueIndex: this.queueIndex,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private buildRandomQueue(): number[] {
    return shuffleArray(this.playlist.map(t => t.id));
  }

  private isValidQueue(queue: any): queue is number[] {
    return Array.isArray(queue) && queue.length === this.playlist.length;
  }

  private clampIndex(index: number, length: number) {
    return Math.min(Math.max(Math.floor(index || 0), 0), length - 1);
  }
}

export const bgmController = BgmController.getInstance();