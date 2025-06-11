/**
 * 读取文件内容为文本
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('文件读取失败：结果不是字符串'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    // 尝试以UTF-8编码读取，如果失败则尝试其他编码
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * 下载文本内容为文件
 */
export function downloadTextAsFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理URL对象
  URL.revokeObjectURL(url);
}

/**
 * 验证文件类型
 */
export function validateSubtitleFile(file: File): { valid: boolean; error?: string } {
  const allowedExtensions = ['.srt', '.vtt', '.ass', '.ssa'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  // 检查文件大小
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '文件大小超过限制（最大10MB）'
    };
  }
  
  // 检查文件扩展名
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `不支持的文件格式。支持的格式：${allowedExtensions.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 生成翻译后的文件名
 */
export function generateTranslatedFilename(originalFilename: string, targetLanguage: string): string {
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const nameWithoutExtension = originalFilename.substring(0, lastDotIndex);
  const extension = originalFilename.substring(lastDotIndex);
  
  return `${nameWithoutExtension}_${targetLanguage}${extension}`;
}

/**
 * 检测文件编码（简单实现）
 */
export async function detectFileEncoding(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer.slice(0, 1024)); // 只检查前1KB
      
      // 检测BOM
      if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
        resolve('UTF-8');
        return;
      }
      
      if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
        resolve('UTF-16LE');
        return;
      }
      
      if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
        resolve('UTF-16BE');
        return;
      }
      
      // 简单的UTF-8检测
      let isUTF8 = true;
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] > 127) {
          // 检查UTF-8多字节序列
          if ((bytes[i] & 0xE0) === 0xC0) {
            if (i + 1 >= bytes.length || (bytes[i + 1] & 0xC0) !== 0x80) {
              isUTF8 = false;
              break;
            }
            i++;
          } else if ((bytes[i] & 0xF0) === 0xE0) {
            if (i + 2 >= bytes.length || 
                (bytes[i + 1] & 0xC0) !== 0x80 || 
                (bytes[i + 2] & 0xC0) !== 0x80) {
              isUTF8 = false;
              break;
            }
            i += 2;
          } else if ((bytes[i] & 0xF8) === 0xF0) {
            if (i + 3 >= bytes.length || 
                (bytes[i + 1] & 0xC0) !== 0x80 || 
                (bytes[i + 2] & 0xC0) !== 0x80 || 
                (bytes[i + 3] & 0xC0) !== 0x80) {
              isUTF8 = false;
              break;
            }
            i += 3;
          } else {
            isUTF8 = false;
            break;
          }
        }
      }
      
      resolve(isUTF8 ? 'UTF-8' : 'GBK');
    };
    
    reader.readAsArrayBuffer(file);
  });
}
