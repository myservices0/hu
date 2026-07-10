async function processImageHandshake() {
    const inputField = document.getElementById('promptInput');
    const promptText = inputField.value.trim();
    const genButton = document.getElementById('genBtn');
    
    if (!promptText) return;

    inputField.value = "";
    inputField.disabled = true;
    genButton.disabled = true;

    appendBubble(promptText, 'user');

    document.getElementById('placeholderText').style.display = 'none';
    document.getElementById('outputImg').style.display = 'none';
    document.getElementById('loader').style.display = 'flex';

    let success = false;
    let attempts = 0;
    
    while (!success && attempts < 3) {
        try {
            attempts++;
            if(attempts > 1) {
                appendBubble(`Connection congested. Retrying line match (Attempt ${attempts}/3)...`, 'ai');
                await new Promise(r => setTimeout(r, 2000));
            }
            
            // FIX: Pass prompt inside an object wrapper, not a raw string
            const response = await puter.ai.txt2img({
                prompt: promptText
            });
            
            // FIX: Puter natively supplies the image link via the .url property
            const imgElement = document.getElementById('outputImg');
            imgElement.src = response.url;
            imgElement.style.display = 'block';

            appendBubble(`Image generated successfully!`, 'ai');
            success = true;

        } catch (error) {
            console.error(`Attempt ${attempts} failed:`, error);
            if(attempts >= 3) {
                appendBubble("The free public AI node is currently overloaded. Wait 15 seconds and try a different prompt!", 'ai');
                document.getElementById('placeholderText').style.display = 'block';
            }
        }
    }

    document.getElementById('loader').style.display = 'none';
    inputField.disabled = false;
    genButton.disabled = false;
    inputField.focus();
}
