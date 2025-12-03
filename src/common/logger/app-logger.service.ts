import { LoggerService, LogLevel } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

type SupportedLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose';

const levelPriority: Record<SupportedLevel, number> = {
  error: 0,
  warn: 1,
  log: 2,
  debug: 3,
  verbose: 4,
};

const normalizeLevel = (raw?: string): SupportedLevel => {
  const candidate = raw?.toLowerCase();
  if (candidate === 'error') return 'error';
  if (candidate === 'warn' || candidate === 'warning') return 'warn';
  if (candidate === 'debug') return 'debug';
  if (candidate === 'verbose') return 'verbose';
  return 'log';
};

export class AppLogger implements LoggerService {
  private readonly logDir: string;
  private readonly baseName: string;
  private readonly extension: string;
  private readonly maxFiles: number;
  private readonly minLevel: SupportedLevel;
  private lastPruneDate = '';

  constructor() {
    this.logDir = process.env.LOG_DIR ?? 'logs';
    const fileName = process.env.LOG_FILE ?? 'microservice-user-auth.log';
    this.baseName = fileName.replace(path.extname(fileName), '') || 'user-auth';
    this.extension = path.extname(fileName) || '.log';
    this.maxFiles = Number.parseInt(process.env.LOG_BACKUP_COUNT ?? '7', 10);
    this.minLevel = normalizeLevel(process.env.LOG_LEVEL);

    fs.mkdirSync(this.logDir, { recursive: true });
  }

  log(message: any, ...optionalParams: any[]): void {
    this.write('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.write('warn', message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]): void {
    this.write('verbose', message, optionalParams);
  }

  private write(level: SupportedLevel, message: any, optionalParams: any[]) {
    if (!this.shouldLog(level)) {
      return;
    }

    const context =
      optionalParams.find((p) => typeof p === 'string') ?? 'AppLogger';
    const serializedParams = optionalParams
      .filter((p) => typeof p !== 'string')
      .map((p) => (typeof p === 'object' ? JSON.stringify(p) : String(p)))
      .join(' ');

    const formattedMessage = `[${context}] ${message}${
      serializedParams ? ` ${serializedParams}` : ''
    }`;

    this.writeConsole(level, formattedMessage);
    void this.persistToFile(level, formattedMessage);
  }

  private shouldLog(level: SupportedLevel): boolean {
    return levelPriority[level] <= levelPriority[this.minLevel];
  }

  private writeConsole(level: SupportedLevel, formattedMessage: string) {
    const stamp = new Date().toISOString();
    const output = `${stamp} ${level.toUpperCase()}: ${formattedMessage}`;
    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
      case 'verbose':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  private async persistToFile(level: SupportedLevel, formattedMessage: string) {
    try {
      const now = new Date();
      const dateSuffix = now.toISOString().slice(0, 10);
      const filePath = path.join(
        this.logDir,
        `${this.baseName}-${dateSuffix}${this.extension}`,
      );

      const line = `${now.toISOString()} ${level.toUpperCase()}: ${formattedMessage}\n`;
      await fs.promises.appendFile(filePath, line, { encoding: 'utf8' });
      await this.pruneOldFiles(dateSuffix);
    } catch (err) {
      console.error('Failed to write log file', err);
    }
  }

  private async pruneOldFiles(currentSuffix: string) {
    if (this.maxFiles <= 0) {
      return;
    }
    if (this.lastPruneDate === currentSuffix) {
      return;
    }

    this.lastPruneDate = currentSuffix;

    try {
      const files = await fs.promises.readdir(this.logDir);
      const escapedBase = this.escapeRegex(this.baseName);
      const escapedExt = this.escapeRegex(this.extension);
      const pattern = new RegExp(`^${escapedBase}-\\d{4}-\\d{2}-\\d{2}${escapedExt}$`);

      const matching = files.filter((file) => pattern.test(file)).sort();

      if (matching.length > this.maxFiles) {
        const toDelete = matching.slice(0, matching.length - this.maxFiles);
        await Promise.allSettled(
          toDelete.map((file) =>
            fs.promises.rm(path.join(this.logDir, file)).catch(() => undefined),
          ),
        );
      }
    } catch (err) {
      console.error('Failed to prune old log files', err);
    }
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
