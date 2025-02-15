import React from 'react';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { CustomScrollbar } from 'components';
import { Notification } from 'components/index';
import CapturePanel from './CapturePanel';
import LiveSourceTable from './LiveSourceTable';
import CaptureHeaderHOC from './Header/CaptureHeaderHOC';
import { useRecoilValue } from 'recoil';
import useRecoilLiveSourceHandler from '../../store/gui/liveSource/useRecoilLiveSourceHandler';
import { liveSourceAtom } from '../../store/gui/liveSource/liveSource';
import { pcapsAnalysingAtom } from '../../store/gui/pcaps/pcapsAnalysing';
import { pcapsCapturingAtom } from '../../store/gui/pcaps/pcapsCapturing';
import { pcapsAtom } from '../../store/gui/pcaps/pcaps';
import { pcapCapturingToTile, pcapAnalysingToTile, pcapToTile } from 'pages/Common/DashboardTileHOC';
import './styles.scss';

interface IComponentProps {
    onTileDoubleClick: (id: string) => void;
}

function CaptureContent({
    onTileDoubleClick,
}: IComponentProps) {

    useRecoilLiveSourceHandler();
    const liveSourceTableData = useRecoilValue(liveSourceAtom);
    const [selectedLiveSourceIds, setSelectedLiveSourceIds] = React.useState<string[]>([]);
    const [filename, setFilename] = React.useState<string>('');

    const onRowClick = (item: any, e: React.MouseEvent<HTMLElement>) => {
        if (e.ctrlKey) {
            if (selectedLiveSourceIds.includes(item.id)) {
                setSelectedLiveSourceIds(selectedLiveSourceIds.filter(i => i !== item.id));
            } else {
                setSelectedLiveSourceIds([...selectedLiveSourceIds, item.id]);
            }
        } else {
            setSelectedLiveSourceIds([item.id]);
        }
    };

    const onCapture = async (name: string, duration: number) => {
        const datetime: string = new Date().toLocaleString().split(" ").join("-").split("/").join("-");
        const newFilename: string = `${name}-${datetime}`;
        setFilename(newFilename);

        console.log(`Capturing ${newFilename}`)
        const captureResult = await list.live.startCapture(newFilename, duration, selectedLiveSourceIds);
        if (!captureResult) {
            console.error('Pcap capture failed');
            Notification({
                typeMessage: 'error',
                message: (
                    <div>
                        <p>Could not capture pcap {name}</p>
                        <p> {captureResult} </p>
                    </div>
                ),
            });
            return;
        }

        const awaiterResult = await list.live.makeCaptureAwaiter(newFilename, 10 * duration);
        if (!awaiterResult) {
            console.error('Pcap analysis failed');
            Notification({
                typeMessage: 'error',
                message: (
                    <div>
                        <p>Could not analyze pcap {name}</p>
                        <p> {awaiterResult} </p>
                    </div>
                ),
            });
            return;
        }
    };

    const pcapsFinished = useRecoilValue(pcapsAtom);
    const pcapsAnalysing = useRecoilValue(pcapsAnalysingAtom);
    const pcapsCapturing = useRecoilValue(pcapsCapturingAtom);

    return ( <>
            <div className="main-page-header">
                <CaptureHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <div className="capture-content-row">
                        <CapturePanel
                            onCapture={onCapture}
                            sourceNum={selectedLiveSourceIds.length}
                        />
                        {
                            pcapsCapturing
                                .filter((pcap: SDK.types.IPcapFileCapturing) => pcap.file_name !== undefined && pcap.file_name === filename)
                                .map((pcap: SDK.types.IPcapFileCapturing, index: number) => pcapCapturingToTile(pcap.file_name, pcap.progress))
                        }
                        {
                            pcapsAnalysing
                                .filter((pcap: SDK.types.IPcapFileReceived) => pcap.file_name !== undefined && pcap.file_name === filename)
                                .map((pcap: SDK.types.IPcapFileReceived, index: number) => pcapAnalysingToTile(pcap))
                        }
                        {
                            pcapsFinished
                            .filter((pcap: SDK.types.IPcapInfo) => pcap.file_name !== undefined && pcap.file_name === filename)
                            .map((pcap: SDK.types.IPcapInfo, index: number) => pcapToTile(onTileDoubleClick, ()=>{}, pcap, 0, []))
                        }
                    </div>

                    <LiveSourceTable
                        liveSourceTableData={liveSourceTableData}
                        onRowClick={onRowClick}
                        selectedLiveSourceIds={selectedLiveSourceIds}
                    />
                </CustomScrollbar>
            </div>
        </>
    );
}

export default CaptureContent;
