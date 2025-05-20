function payloadTooLargeError(err, req, res, next) {
  if (err.status === 413 || err.type === 'entity.too.large') {
    const receivedSize = req.get('Content-Length');
    let details = null;
    
    if (receivedSize) {
      const sizeInMB = Math.round(parseInt(receivedSize) / (1024 * 1024));
      details = `Tamaño recibido: ${sizeInMB}MB | Límite: 10MB`;
    }

    return res.status(413).json({ 
      success: false,
      error: 'La imagen excede el límite de tamaño permitido',
      details,
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  next(err);
}

module.exports = payloadTooLargeError;