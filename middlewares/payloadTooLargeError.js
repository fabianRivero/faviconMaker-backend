export default function payloadTooLargeError(err, req, res, next){
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ 
            success: false,
            error: `La imagen es demasiado grande. Límite: 10MB`,
            details: req.get('Content-Length') 
            ? `Tamaño recibido: ${Math.round(parseInt(req.get('Content-Length')) / (1024 * 1024))}MB`
            : null
    });
  }
  next(err);

}


