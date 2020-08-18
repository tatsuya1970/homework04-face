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

  fan_status = 0
  send_obniz = 0

  setInterval(async () => {
    //１つの顔だけなのでfaceapi.detectSingleFaceを利用、全ての顔を検出するにはfaceapi.detectAllFaces
    //const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    console.debug("resizedDetections",resizedDetections)
    if (resizedDetections[0] != null) {

       let disgusted = resizedDetections[0].expressions.disgusted
       let happy = resizedDetections[0].expressions.happy
       let neutral = resizedDetections[0].expressions.neutral
       
       console.debug("neutral",neutral,"happy",happy)

       if (fan_status == 0 && neutral < 0.9) {
         fan_status = 1
         send_obniz = 1
        }
        if (fan_status == 1 && happy > 0.5) {
          fan_status = 0
          send_obniz = 1
         }

         //obnizクラウドへPOST
         if (send_obniz == 1){
          send_obniz = 0
          let value=[{"value":fan_status}];
          const url="https://obniz.io/events/1366/OlHhTPjhOYsk_xCAkojp5xrojyaJKR_9/run"; //ここにobnizのURLを入力
 
          Promise.all(post(value,url))   
           .then((result) => {})
           .catch((result) => {});
         
         }  
    }
  
  }, 3000)

})

//POST通信  ここのを丸写し　https://www.it-swarm.dev/ja/javascript/%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%81%AA%E3%81%97%E3%81%A7post%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E9%80%81%E4%BF%A1%E3%81%99%E3%82%8B%E7%B4%94%E7%B2%8B%E3%81%AAjavascript/972618857/
function post(value,url) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    value: value
  }));
}
