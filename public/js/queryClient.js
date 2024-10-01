
function querySearch() {

    // Print loading wheel
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    const wheelCont = document.createElement('div');
    wheelCont.classList.add('loader-container')
    const wheel = document.createElement('div')
    wheel.classList.add('loader');
    wheelCont.appendChild(wheel)
    resultsDiv.appendChild(wheelCont)

    // Get search text
    queryText = document.getElementById('searchBar').value;

    // Get encoder
    let encoderName = document.getElementById('encoder').value;

    // Url
    url = `http://localhost:3000/query/milvus?text=${queryText}&encoder=${encoderName}`

    try {
        fetch(url)
            .then(response => {
                if(!response.ok) {
                    throw new Error('Error with search query');
                }
                return response.json()
            })
            .then(data => {
                printVideos(data);
            })

    } catch(error) {
        console.error('No response obtained from server.')
    };

}

function printVideos(videosJson) {

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    videosJson.results.forEach(element => {

        // Extract info
        //let video_name = element.video;
        let start_frame = element.start_frame;
        let end_frame = element.end_frame;
        let video_name = element.video;

        // Create entry division
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entry');

        // Create video element
        const videoPlayer = document.createElement('video');
        videoPlayer.classList.add('videoPlayer');
        videoPlayer.controls = true;
        videoPlayer.muted = true;

        // Add source
        const source = document.createElement('source');
        source.src = `/video?name=${video_name}&startFrame=${start_frame}&endFrame=${end_frame}`;
        source.type = 'video/mp4';
        videoPlayer.appendChild(source);

        // Create video metadata div
        const videoInfoDiv = document.createElement('div');
        videoInfoDiv.classList.add('video-info');

        // Create camera name paragraph
        const cameraInfo = document.createElement('p');
        cameraInfo.textContent = `Camera: ${video_name}`;

        // Create date paragraph
        const dateInfo = document.createElement('p');
        dateInfo.textContent = `Date: ${element.sentence}`;

        // Append paragraphs to videoInfoDiv
        videoInfoDiv.appendChild(cameraInfo);
        videoInfoDiv.appendChild(dateInfo);

        // Create the horizontal line (hr)
        const hrElement = document.createElement('hr');

        // Append video, info, and hr to the entry div
        entryDiv.appendChild(videoPlayer);
        entryDiv.appendChild(videoInfoDiv);
        entryDiv.appendChild(hrElement);

        // Append the entire entry div to the results div
        resultsDiv.appendChild(entryDiv);

    });
}
