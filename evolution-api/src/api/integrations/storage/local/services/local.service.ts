import { ConfigService } from '@config/env.config';
import { Logger } from '@config/logger.config';
import { BadRequestException } from '@exceptions';
import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { access, mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';

export class LocalStorageService {
  private readonly logger = new Logger('LocalStorageService');
  private readonly config: ConfigService;
  private readonly basePath: string;
  private readonly baseUrl: string;
  private readonly organizeByDate: boolean;

  constructor(config: ConfigService) {
    this.config = config;
    const localStorageConfig = this.config.get('LOCAL_STORAGE');

    if (!localStorageConfig?.ENABLED) {
      throw new Error('Local storage is not enabled');
    }

    this.basePath = localStorageConfig.PATH;
    this.baseUrl = localStorageConfig.BASE_URL;
    this.organizeByDate = localStorageConfig.ORGANIZE_BY_DATE || false;

    this.ensureDirectoriesExist();
  }

  private async ensureDirectoriesExist() {
    const directories = [
      this.basePath,
      join(this.basePath, 'images'),
      join(this.basePath, 'videos'),
      join(this.basePath, 'audios'),
      join(this.basePath, 'documents'),
      join(this.basePath, 'stickers'),
    ];

    for (const dir of directories) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    }
  }

  private getMediaTypeFolder(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'images';
    if (mimetype.startsWith('video/')) return 'videos';
    if (mimetype.startsWith('audio/')) return 'audios';
    if (mimetype.includes('sticker')) return 'stickers';
    return 'documents';
  }

  private generateFilename(originalName: string, mimetype: string): string {
    const timestamp = Date.now();
    const hash = createHash('md5').update(`${originalName}-${timestamp}`).digest('hex').substring(0, 8);
    const ext = extname(originalName) || this.getExtensionFromMimetype(mimetype);
    return `${timestamp}-${hash}${ext}`;
  }

  private getExtensionFromMimetype(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/ogg': '.ogg',
      'audio/wav': '.wav',
      'application/pdf': '.pdf',
      'application/zip': '.zip',
    };
    return map[mimetype] || '';
  }

  private getDateFolder(): string {
    if (!this.organizeByDate) return '';
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Save media file to local storage
   */
  public async saveMedia(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
  ): Promise<{ fileName: string; mediaUrl: string }> {
    try {
      const typeFolder = this.getMediaTypeFolder(mimetype);
      const dateFolder = this.getDateFolder();
      const filename = this.generateFilename(originalName, mimetype);

      // Build path: uploads/media/images/2026-08/filename.jpg
      const relativePath = dateFolder ? join(typeFolder, dateFolder, filename) : join(typeFolder, filename);

      const fullPath = join(this.basePath, relativePath);

      // Ensure date subfolder exists
      if (dateFolder) {
        const dateFolderPath = join(this.basePath, typeFolder, dateFolder);
        if (!existsSync(dateFolderPath)) {
          await mkdir(dateFolderPath, { recursive: true });
        }
      }

      // Write file
      await writeFile(fullPath, buffer);

      // Generate public URL
      const mediaUrl = `${this.baseUrl}/media/${relativePath.replace(/\\/g, '/')}`;

      this.logger.log(`Saved media: ${relativePath}`);

      return {
        fileName: relativePath,
        mediaUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to save media: ${error.message}`);
      throw new BadRequestException(`Failed to save media: ${error.message}`);
    }
  }

  /**
   * Delete media file from local storage
   */
  public async deleteMedia(fileName: string): Promise<void> {
    try {
      const fullPath = join(this.basePath, fileName);

      // Check if file exists
      await access(fullPath);

      // Delete file
      await unlink(fullPath);

      this.logger.log(`Deleted media: ${fileName}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`Media file not found: ${fileName}`);
        return; // File doesn't exist, no error
      }
      this.logger.error(`Failed to delete media: ${error.message}`);
      throw new BadRequestException(`Failed to delete media: ${error.message}`);
    }
  }

  /**
   * Get media URL
   */
  public getMediaUrl(fileName: string): string {
    return `${this.baseUrl}/media/${fileName.replace(/\\/g, '/')}`;
  }

  /**
   * Check if local storage is enabled
   */
  public static isEnabled(config: ConfigService): boolean {
    return config.get('LOCAL_STORAGE')?.ENABLED === true;
  }
}
