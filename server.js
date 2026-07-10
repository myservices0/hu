<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VULCAN CORE // STANDALONE MAIL MATRIX</title>
    <style>
        :root {
            --bg-base: #0a0b10;
            --bg-surface: #141622;
            --bg-card: #1c1f30;
            --accent-cyan: #00f3ff;
            --accent-pink: #ff0077;
            --text-main: #e2e8f0;
            --text-muted: #64748b;
        }
        body {
            background-color: var(--bg-base); color: var(--text-main);
            font-family: 'Segoe UI', sans-serif; margin: 0; padding: 25px;
            display: flex; flex-direction: column; height: 100vh; box-sizing: border-box;
        }
        .hud-panel {
            background: var(--bg-surface); padding: 20px; border-radius: 10px;
            border: 2px solid var(--accent-cyan); box-shadow: 0 0 20px rgba(0, 243, 255, 0.15);
            display: flex; gap: 20px; align-items: center; margin-bottom: 25px;
        }
        .hud-panel h1 { margin: 0; font-size: 22px; color: var(--accent-cyan); letter-spacing: 1px; text-transform: uppercase; }
        .input-box {
            background: var(--bg-base); border: 1px solid var(--text-muted);
            padding: 12px; color: #fff; border-radius: 6px; font-weight: bold; width: 180px; outline: none;
        }
        .btn-generate {
            background: linear-gradient(135deg, var(--accent-cyan), #00a2ff);
            border: none; padding: 12px 24px; color: #000; font-weight: 800;
            border-radius: 6px; cursor: pointer; text-transform: uppercase; transition: 0.2s;
        }
        .btn-generate:hover { transform: scale(1.02); box-shadow: 0 0 15px var(--accent-cyan); }
        
        .workspace-core { display: flex; gap: 25px; flex: 1; min-height: 0; }
        .sidebar-deck {
            width: 380px; background: var(--bg-surface); border-radius: 10px;
            border: 1px solid var(--bg-card); padding: 15px; display: flex;
            flex-direction: column; gap: 12px; overflow-y: auto;
        }
        .inbox-node {
            background: var(--bg-card); padding: 14px; border-radius: 8px; border: 1px solid transparent;
            cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.2s;
        }
        .inbox-node:hover, .inbox-node.active { border-color: var(--accent-cyan); background: #22263d; }
        .email-string { font-size: 13px; font-family: monospace; color: #fff; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }
        .badge-count {
            background: var(--accent-pink); color: white; border-radius: 20px;
            padding: 2px 8px; font-size: 11px; font-weight: 900; display: none; box-shadow: 0 0 8px var(--accent-pink);
        }
        .btn-delete { color: var(--text-muted); font-weight: bold; cursor: pointer; padding: 2px 6px; transition: 0.2s; }
        .btn-delete:hover { color: var(--accent-pink); }
        
        .terminal-viewport {
            flex: 1; background: var(--bg-surface); border-radius: 10px;
            border: 1px solid var(--bg-card); display: flex; flex-direction: column; padding: 25px;
        }
        .message-stream-list {
            max-height: 180px; overflow-y: auto; border-bottom: 2px solid var(--bg-card);
            margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; padding-bottom: 15px;
        }
        .message-row { 
            background: var(--bg-card); padding: 14px; border-radius: 6px; cursor: pointer; 
            border-left: 4px solid var(--accent-cyan); transition: 0.2s;
        }
        .message-row:hover { background: #22263d; }
        .content-box-frame {
            flex: 1; background: var(--bg-base); border-radius: 8px; padding: 20px; overflow-y: auto; color: #fff;
            border: 1px solid var(--bg-card);
        }
    </style>
</head>
<body>

<div class="hud-panel">
    <h1>Vulcan Standalone Matrix</h1>
    <input type="number" id="count" class="input-box" min="1" max="50" value="5">
    <button class="btn-generate" onclick="generateRandomMatrix()">Generate Fleet</button>
</div>

<div class="workspace-core">
    <div class="sidebar-deck" id="deckContainer">
        <div style="color:var(--text-muted)">Matrix terminal offline. Input values above.</div>
    </div>
    <div class="terminal-viewport">
        <h3 style="margin-top:0; color: var(--accent-cyan);" id="currentViewingTitle">SELECT ACTIVE INBOX NODE</h3>
        <div class="message-stream-list" id="streamContainer"></div>
        <div class="content-box-frame" id="bodyContainer">Select an email above to view its contents...</div>
    </div>
</div>

<script>
    let activeNodes = [];
    let selectedNode = null;
    let daemon = null;
    const MAIL_API = "https://api.mail.tm";
    let activeDomain = "";

    async function initDomainPool() {
        try {
            const res = await fetch(`${MAIL_API}/domains`);
            const data = await res.json();
            if (data['hydra:member'] && data['hydra:member'].length > 0) {
                activeDomain = data['hydra:member'][0].domain;
            }
        } catch (err) { console.log("Domain error"); }
    }

    async function generateRandomMatrix() {
        const count = parseInt(document.getElementById('count').value) || 1;
        document.getElementById('deckContainer').innerHTML = "<div style='color: var(--accent-cyan)'>Connecting directly to mail registry...</div>";
        
        if (!activeDomain) await initDomainPool();

        activeNodes = [];
        for (let i = 0; i < count; i++) {
            const randomString = Math.random().toString(36).substring(2, 10);
            const emailAddress = `${randomString}@${activeDomain}`.toLowerCase();
            const securePassword = `VulcPass_${Math.floor(1000 + Math.random() * 9000)}!`;

            try {
                await fetch(`${MAIL_API}/accounts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: emailAddress, password: securePassword })
                });
                
                const authRes = await fetch(`${MAIL_API}/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: emailAddress, password: securePassword })
                });
                const authData = await authRes.json();
                
                activeNodes.push({ email: emailAddress, token: authData.token });
            } catch (err) {}
        }
        
        renderDeck();
        if(daemon) clearInterval(daemon);
        daemon = setInterval(pollInboxes, 3000);
    }

    function renderDeck() {
        const container = document.getElementById('deckContainer');
        container.innerHTML = activeNodes.length === 0 ? "<div style='color:var(--text-muted)'>No active emails.</div>" : "";
        activeNodes.forEach((node, index) => {
            const row = document.createElement('div');
            row.className = `inbox-node ${selectedNode?.email === node.email ? 'active' : ''}`;
            row.setAttribute('onclick', `selectNode(${index})`);
            row.innerHTML = `
                <div class="email-string">${node.email}</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="badge-count" id="badge-${index}">0</span>
                    <span class="btn-delete" onclick="deleteNode(event, ${index})">✕</span>
                </div>
            `;
            container.appendChild(row);
        });
    }

    function selectNode(index) {
        selectedNode = activeNodes[index];
        renderDeck();
        document.getElementById('currentViewingTitle').innerText = selectedNode.email;
        fetchMail();
    }

    function deleteNode(event, index) {
        event.stopPropagation();
        if (selectedNode?.email === activeNodes[index].email) {
            selectedNode = null;
            document.getElementById('currentViewingTitle').innerText = "SELECT ACTIVE INBOX NODE";
            document.getElementById('streamContainer').innerHTML = "";
            document.getElementById('bodyContainer').innerHTML = "Select an email above to view its contents...";
        }
        activeNodes.splice(index, 1);
        renderDeck();
    }

    async function fetchMail() {
        if (!selectedNode) return;
        const res = await fetch(`${MAIL_API}/messages`, {
            headers: { Authorization: `Bearer ${selectedNode.token}` }
        });
        const data = await res.json();
        const container = document.getElementById('streamContainer');
        container.innerHTML = data['hydra:member'].length === 0 ? "<div style='color:var(--text-muted); padding: 10px;'>Awaiting incoming transmissions...</div>" : "";
        
        data['hydra:member'].forEach(msg => {
            const div = document.createElement('div');
            div.className = "message-row";
            div.onclick = () => loadBody(msg.id);
            div.innerHTML = `
                <div style="color:var(--accent-cyan); font-size:12px; font-weight: bold;">From: ${msg.from.address}</div>
                <div style="font-weight:bold; margin-top:3px; color:#fff;">${msg.subject || '(No Subject)'}</div>
            `;
            container.appendChild(div);
        });
    }

    async function loadBody(id) {
        if (!selectedNode) return;
        document.getElementById('bodyContainer').innerHTML = "De-encrypting data...";
        const res = await fetch(`${MAIL_API}/messages/${id}`, {
            headers: { Authorization: `Bearer ${selectedNode.token}` }
        });
        const data = await res.json();
        document.getElementById('bodyContainer').innerHTML = data.html || data.text;
    }

    async function pollInboxes() {
        activeNodes.forEach(async (node, index) => {
            try {
                const res = await fetch(`${MAIL_API}/messages`, {
                    headers: { Authorization: `Bearer ${node.token}` }
                });
                const data = await res.json();
                const badge = document.getElementById(`badge-${index}`);
                if (badge) {
                    const count = data['hydra:member'].length;
                    if (count > 0) {
                        badge.innerText = count;
                        badge.style.display = "block";
                        if (selectedNode?.email === node.email) fetchMail();
                    } else {
                        badge.style.display = "none";
                    }
                }
            } catch(e) {}
        });
    }
</script>
</body>
</html>
