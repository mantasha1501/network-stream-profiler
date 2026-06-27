// Global Networking Context References
let activeWebSocketInstance = null;
let historicalConnectionCache = new Set();

// Toggles core Web Socket connection channels
function toggleNetworkSocketConnection() {
    const targetUrlInput = document.getElementById('wsUrlInput').value.trim();
    const connectButtonField = document.getElementById('connectBtn');
    
    if (!targetUrlInput) return;

    if (activeWebSocketInstance === null) {
        pushPacketToStreamLog(`[CONNECTION]: Launching network bridge pipe to ${targetUrlInput}...`);
        connectButtonField.innerText = "Halt";
        connectButtonField.style.backgroundColor = "#DC2626"; // Hard Red when active

        try {
            activeWebSocketInstance = new WebSocket(targetUrlInput);
            
            activeWebSocketInstance.onopen = () => {
                document.getElementById('statusPill').className = "status-badge status-connected";
                document.getElementById('statusText').innerText = "ONLINE";
                document.getElementById('payloadInput').disabled = false;
                document.getElementById('sendBtn').disabled = false;
                
                pushPacketToStreamLog(`[SUCCESS]: Full-Duplex persistent connection established seamlessly.`, 'inbound-row');
                cacheServerHistoryTarget(targetUrlInput);
            };

            activeWebSocketInstance.onmessage = (eventPayload) => {
                pushPacketToStreamLog(`[INBOUND]: Received Frame <- ${eventPayload.data}`, 'inbound-row');
            };

            activeWebSocketInstance.onerror = () => {
                pushPacketToStreamLog(`[ERROR]: Handshake interception error registered on active channel.`, 'error-row');
            };

            activeWebSocketInstance.onclose = () => {
                teardownActiveSocketState();
                pushPacketToStreamLog(`[CONNECTION]: Persistent routing tunnel detached securely.`, 'system-row');
            };

        } catch (connectionError) {
            pushPacketToStreamLog(`[FATAL]: Routing matrix abort: ${connectionError.message}`, 'error-row');
            teardownActiveSocketState();
        }
    } else {
        pushPacketToStreamLog(`[CONNECTION]: Transmitting programmatic disengage signal...`);
        activeWebSocketInstance.close();
    }
}

function teardownActiveSocketState() {
    activeWebSocketInstance = null;
    
    document.getElementById('statusPill').className = "status-badge";
    document.getElementById('statusText').innerText = "OFFLINE";
    document.getElementById('payloadInput').disabled = true;
    document.getElementById('sendBtn').disabled = true;
    
    const connectButtonField = document.getElementById('connectBtn');
    connectButtonField.innerText = "Engage";
    connectButtonField.style.backgroundColor = "#111827"; // Back to stark black
}

function transmitSocketPayload() {
    const rawPayloadContent = document.getElementById('payloadInput').value.trim();
    if (!rawPayloadContent || !activeWebSocketInstance) return;

    if (activeWebSocketInstance.readyState === WebSocket.OPEN) {
        activeWebSocketInstance.send(rawPayloadContent);
        pushPacketToStreamLog(`[OUTBOUND]: Dispatched Frame -> ${rawPayloadContent}`, 'outbound-row');
        document.getElementById('payloadInput').value = '';
    } else {
        pushPacketToStreamLog(`[ERROR]: Outbound block failed. Pipeline is disconnected.`, 'error-row');
    }
}

function cacheServerHistoryTarget(urlEndpointStr) {
    if (historicalConnectionCache.has(urlEndpointStr)) return;
    
    historicalConnectionCache.add(urlEndpointStr);
    const logList = document.getElementById('historyLogList');
    
    if (historicalConnectionCache.size === 1) {
        logList.innerHTML = '';
    }

    const itemRowNode = document.createElement('div');
    itemRowNode.className = 'cache-item';
    itemRowNode.innerText = urlEndpointStr.replace('wss://', '');
    itemRowNode.title = urlEndpointStr;
    
    itemRowNode.onclick = () => {
        if (activeWebSocketInstance === null) {
            document.getElementById('wsUrlInput').value = urlEndpointStr;
            pushPacketToStreamLog(`[CACHE]: Mounted target URL context configuration.`);
        }
    };

    logList.appendChild(itemRowNode);
}

function pushPacketToStreamLog(logText, traceStyleClass = 'system-row') {
    const container = document.getElementById('terminalPacketFeed');
    const dynamicLineNode = document.createElement('div');
    dynamicLineNode.className = `feed-row ${traceStyleClass}`;
    
    const timestampCode = new Date().toISOString().split('T')[1].substring(0, 8);
    dynamicLineNode.innerText = `[${timestampCode}] ${logText}`;
    
    container.appendChild(dynamicLineNode);
    container.scrollTop = container.scrollHeight;
}

function clearStreamLogs() {
    document.getElementById('terminalPacketFeed').innerHTML = '';
    pushPacketToStreamLog("[SYSTEM]: Internal packet frame cache flushed cleanly.");
}