export const KB = 1024;
export const MB = KB * 1024;
export const GB = MB * 1024;
export const TB = GB * 1024;

/**
 * 파일 크기 포맷
 * @param {number} length 파일 크기
 * @param {string?} unit 포맷단위. [TB | GB | MB | KB | null]
 * @returns
 */
export const formatSize = (length, unit) => {
  let l = parseInt(length);

  if (!unit) {
    if (l > TB) unit = 'TB';
    else if (l > GB) unit = 'GB';
    else if (l > MB) unit = 'MB';
    else unit = 'KB';
  }

  switch (unit) {
    case 'TB':
      return (l / TB).toFixed(2) + unit;
    case 'GB':
      return (l / GB).toFixed(1) + unit;
    case 'MB':
      return (l / MB).toFixed(0) + unit;
    case 'KB':
      return (l / KB).toFixed(0) + unit;
    default:
      return l + 'B';
  }
};

export function getFileIcon(file) {
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
