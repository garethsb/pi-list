import React from 'react';
import '../styles.scss';
import VideoAnalysisDisplay from './Video/VideoAnalysisDisplay';
import SDK from '@bisect/ebu-list-sdk';
import AudioAnalysisDisplay from './Audio/AudioAnalysisDisplay';
import AncillaryAnalysisDisplay from './Ancillary/AncillaryAnalysisDisplay';
import UnknownAnalysisDisplay from './Unknown/UnknownAnalysisDisplay';

const getPcapType = (currentStream: SDK.types.IStreamInfo | undefined, pcapID: string) => {
    switch (currentStream?.full_media_type) {
        case 'video/raw':
            return <VideoAnalysisDisplay currentStream={currentStream} pcapID={pcapID} />;
        case 'audio/L16':
        case 'audio/L24':
            return <AudioAnalysisDisplay currentStream={currentStream} />;
        case 'video/smpte291':
            return <AncillaryAnalysisDisplay currentStream={currentStream} />;
        case 'unknown':
            if (currentStream?.full_transport_type !== 'SRT') {
                return <UnknownAnalysisDisplay currentStream={currentStream} />;
            }
    }
};

function PCapDetailsAnalysisPage({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    return <div className="pcap-details-page-container">{getPcapType(currentStream, pcapID)}</div>;
}

export default PCapDetailsAnalysisPage;
