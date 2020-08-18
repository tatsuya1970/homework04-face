const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    if (resizedDetections[0] != null) {

       let disgusted = resizedDetections[0].expressions.disgusted
       let happy = resizedDetections[0].expressions.happy
       let neutral = resizedDetections[0].expressions.neutral
       
       console.debug("neutral",neutral,"disgusted",disgusted,"happy",happy)
       
       //  FaceExpressions {neutral: 0.9998452663421631, happy: 9.013033377414104e-7, sad: 0.0000016673717482262873, angry: 0.00003788969843299128, fearful: 1.1844626390811186e-9, …}
      //  angry: 0.00003788969843299128
      //  disgusted:
      //  6.673845476257156
      //  e-9
      //  fearful:
      //  1.1844626390811186
      //  e-9
      //  happy:
      //  9.013033377414104
      //  e-7
      //  neutral: 0.9998452663421631
      //  sad: 0.0000016673717482262873
      //  surprised: 0.00011418635403970256
      }

     


  }, 1000)

})
