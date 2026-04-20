import { getVideoDurationInSeconds } from 'get-video-duration';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import fs from 'fs';
import path from 'path';

export interface DurationCalculatorResult {
  duration: number; // in minutes
  type: 'video' | 'audio' | 'text' | 'pdf';
  method: 'extracted' | 'estimated';
}

export class DurationCalculator {
  private static readonly READING_SPEED_WPM = 200; // words per minute
  private static readonly WORDS_PER_PAGE_PDF = 250; // average words per PDF page

  /**
   * Calculate duration for video content
   * @param filePath Path to video file
   * @returns Duration in minutes
   */
  static async calculateVideoDuration(filePath: string): Promise<DurationCalculatorResult> {
    try {
      const durationInSeconds = await getVideoDurationInSeconds(filePath);
      const durationInMinutes = Math.ceil(durationInSeconds / 60);
      
      return {
        duration: durationInMinutes,
        type: 'video',
        method: 'extracted'
      };
    } catch (error) {
      console.error('Error calculating video duration:', error);
      // Fallback: estimate based on file size (rough approximation)
      return {
        duration: 10, // default fallback
        type: 'video',
        method: 'estimated'
      };
    }
  }

  /**
   * Calculate duration for audio content
   * @param filePath Path to audio file
   * @returns Duration in minutes
   */
  static async calculateAudioDuration(filePath: string): Promise<DurationCalculatorResult> {
    try {
      const durationInSeconds = await getAudioDurationInSeconds(filePath);
      const durationInMinutes = Math.ceil(durationInSeconds / 60);
      
      return {
        duration: durationInMinutes,
        type: 'audio',
        method: 'extracted'
      };
    } catch (error) {
      console.error('Error calculating audio duration:', error);
      // Fallback: estimate based on file size
      return {
        duration: 5, // default fallback
        type: 'audio',
        method: 'estimated'
      };
    }
  }

  /**
   * Calculate duration for text content
   * @param text Text content or file path to text file
   * @returns Duration in minutes
   */
  static async calculateTextDuration(text: string): Promise<DurationCalculatorResult> {
    try {
      let textContent = text;
      
      // If it's a file path, read the file
      if (text.includes('.txt') || text.includes('.md')) {
        if (fs.existsSync(text)) {
          textContent = fs.readFileSync(text, 'utf-8');
        }
      }
      
      // Count words (simple word count by splitting on whitespace)
      const wordCount = textContent.trim().split(/\s+/).length;
      const durationInMinutes = Math.ceil(wordCount / this.READING_SPEED_WPM);
      
      return {
        duration: Math.max(1, durationInMinutes), // minimum 1 minute
        type: 'text',
        method: 'estimated'
      };
    } catch (error) {
      console.error('Error calculating text duration:', error);
      return {
        duration: 5, // default fallback
        type: 'text',
        method: 'estimated'
      };
    }
  }

  /**
   * Calculate duration for PDF content
   * @param filePath Path to PDF file
   * @returns Duration in minutes
   */
  static async calculatePdfDuration(filePath: string): Promise<DurationCalculatorResult> {
    try {
      // For now, we'll estimate based on file size or page count
      // In a more advanced implementation, you could use pdf-parse to extract text and count words
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      // Rough estimation: 1MB ≈ 10-15 pages, each page ≈ 1-2 minutes reading time
      const estimatedPages = Math.ceil(fileSizeInMB * 12);
      const estimatedWords = estimatedPages * this.WORDS_PER_PAGE_PDF;
      const durationInMinutes = Math.ceil(estimatedWords / this.READING_SPEED_WPM);
      
      return {
        duration: Math.max(2, durationInMinutes), // minimum 2 minutes for PDFs
        type: 'pdf',
        method: 'estimated'
      };
    } catch (error) {
      console.error('Error calculating PDF duration:', error);
      return {
        duration: 10, // default fallback
        type: 'pdf',
        method: 'estimated'
      };
    }
  }

  /**
   * Main method to calculate duration based on content type
   * @param contentType Type of content ('video', 'audio', 'pdf', 'text')
   * @param contentPath Path to content file or text content
   * @returns Duration calculation result
   */
  static async calculateDuration(
    contentType: 'video' | 'audio' | 'pdf' | 'text',
    contentPath: string
  ): Promise<DurationCalculatorResult> {
    switch (contentType) {
      case 'video':
        return this.calculateVideoDuration(contentPath);
      case 'audio':
        return this.calculateAudioDuration(contentPath);
      case 'pdf':
        return this.calculatePdfDuration(contentPath);
      case 'text':
        return this.calculateTextDuration(contentPath);
      default:
        return {
          duration: 5,
          type: contentType,
          method: 'estimated'
        };
    }
  }

  /**
   * Calculate total course duration from all modules and lessons
   * @param modules Array of modules with lessons
   * @returns Total duration in minutes
   */
  static calculateTotalCourseDuration(modules: Array<{
    lessons: Array<{ duration?: number; type: string }>
  }>): number {
    let totalDuration = 0;
    
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.duration) {
          totalDuration += lesson.duration;
        }
      });
    });
    
    return totalDuration;
  }

  /**
   * Format duration for display
   * @param minutes Duration in minutes
   * @returns Formatted string (e.g., "1h 30m" or "45m")
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }
}