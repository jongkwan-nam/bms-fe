export default class FileUtils {
  static KB = 1024;
  static MB = this.KB * 1024;
  static GB = this.MB * 1024;
  static TB = this.GB * 1024;

  /**
   * 파일 크기 포맷
   * @param {number} length 파일 크기
   * @param {string?} unit 포맷단위. [TB | GB | MB | KB | null]
   * @returns
   */
  static formatSize(length, unit) {
    let l = parseInt(length);

    if (!unit) {
      if (l > this.TB) unit = 'TB';
      else if (l > this.GB) unit = 'GB';
      else if (l > this.MB) unit = 'MB';
      else unit = 'KB';
    }

    switch (unit) {
      case 'TB':
        return (l / this.TB).toFixed(2) + unit;
      case 'GB':
        return (l / this.GB).toFixed(1) + unit;
      case 'MB':
        return (l / this.MB).toFixed(0) + unit;
      case 'KB':
        return (l / this.KB).toFixed(0) + unit;
      default:
        return l + 'B';
    }
  }

  static getFileIcon(file) {
    function getFileType(fileExt, fileType) {
      let type0 = fileType.split('/')[0];
      if (type0 === 'video') return 'video';
      if (type0 === 'audio') return 'audio';
      if (type0 === 'image') return 'image';
      if (['java', 'js', 'cjs', 'css', 'scss', 'json', 'html', 'xml', 'json', 'properties', 'md'].includes(fileExt)) return 'code';
      if (type0 === 'text') return 'text';
      if (['jar', 'tar', 'gz', 'cab', 'zip'].includes(fileExt)) return 'archive';
      if (['ppt', 'pptx'].includes(fileExt)) return 'powerpoint';
      if (['xls', 'xlsx'].includes(fileExt)) return 'excel';
      if (['doc', 'docx'].includes(fileExt)) return 'word';
      if (['pdf'].includes(fileExt)) return 'pdf';

      return 'etc';
    }

    switch (getFileType(file.name.split('.').pop(), file.type)) {
      case 'video':
        return 'file-video-o';
      case 'audio':
        return 'file-audio-o';
      case 'image':
        return 'file-image-o';
      case 'code':
        return 'file-code-o';
      case 'text':
        return 'file-text-o';
      case 'archive':
        return 'file-archive-o';
      case 'powerpoint':
        return 'file-powerpoint-o';
      case 'excel':
        return 'file-excel-o';
      case 'word':
        return 'file-word-o';
      case 'pdf':
        return 'file-pdf-o';
      default:
        return 'file-o';
    }
  }

  /**
   * 확장자
   * @param {string} name
   * @returns
   */
  static getExtension(name) {
    return name.substring(name.lastIndexOf('.') + 1);
  }
}
