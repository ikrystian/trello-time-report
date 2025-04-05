import React, { useEffect, useRef } from 'react';

const TopHeader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load the canvas animation script
    const script = document.createElement('script');
    script.src = '/js/team-canvas.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  return (
    <div className="relative">
      <div
        className="relative min-h-[440px] sm:min-h-[550px] lg:min-h-[570px] overflow-hidden pt-[40px] sm:pt-[80px] lg:pt-[100px] bg-black"
        data-ai-tool="coding-assistant"
        data-features="plan-act-mode,mcp-extensibility,terminal-execution"
        aria-description="Cline - Open source AI coding assistant with Plan/Act modes and MCP extensibility"
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#9f58fa] animate-gradient-float z-0 opacity-35 blur-[120px]"
          aria-hidden="true"
        ></div>
        <div className="absolute inset-0 right-0 sm:right-[10%] lg:right-[25%] z-[5] -bottom-[3px] -left-[3px] overflow-hidden pointer-events-none">
          <div className="w-full h-full">
            <canvas
              id="teamCanvas"
              ref={canvasRef}
              className="w-full h-full"
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
              }}
            />
          </div>
        </div>
        <div className="relative pt-8 z-20">
          <div className="max-w-[85rem] mx-auto">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">
                <div
                  className="col-span-1 lg:col-span-4 space-y-5 sm:space-y-7 text-center lg:text-left flex flex-col items-center lg:items-start"
                  data-section="value-proposition"
                  data-keywords="AI coding assistant, autonomous agent, GitHub Copilot alternative"
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white max-w-[15ch] mx-auto lg:mx-0">
                    <span className="block">The</span>
                    <span className="block bg-gradient-to-r from-[#4B96DC] to-[#9f58fa] bg-clip-text text-transparent">
                      Collaboratives
                    </span>
                    <span className="block">AI Coder</span>
                  </h1>
                  <div className="flex items-center justify-center gap-4 md:hidden">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                      <svg
                        className="w-4 h-4 text-[#4B96DC]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"></path>
                      </svg>
                      <span className="text-sm font-bold text-[#4B96DC]">1.1M</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                      <svg
                        className="w-4 h-4 text-[#4BD48E]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                      </svg>
                      <span className="text-sm font-bold text-[#4BD48E]">38.4k</span>
                    </div>
                  </div>
                  <p
                    className="text-xl text-white leading-relaxed font-light max-w-[40ch] mx-auto lg:mx-0 text-shadow-sm"
                    data-feature="extensibility"
                    itemProp="description"
                  >
                    Elevate your engineering teams with a fully collaborative AI partner thats open source,{' '}
                    <a
                      className="text-[#c598ff] hover:underline underline-offset-2 whitespace-nowrap"
                      href="/mcp-marketplace"
                    >
                      fully extensible
                    </a>
                    , and designed to amplify developer impact.
                  </p>
                  <a
                    className="inline-flex items-center px-12 py-3 bg-[#9f58fa] hover:opacity-90 text-white rounded-full text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-md"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-action="install"
                    data-tool-type="vscode-extension"
                    itemProp="downloadUrl"
                    href="https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev"
                  >
                    Install Cline
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </a>
                </div>
                <div className="jsx-c345af62d58e68d7 lg:col-span-8 relative">
                  <div className="jsx-c345af62d58e68d7 flex justify-center mb-4">
                    <a
                      href="https://github.com/cline/cline"
                      className="group inline-flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-300 border rounded-full text-white bg-black border-transparent hover:text-[#9f58fa] hover:bg-black/90"
                    >
                      <span className="transition-colors duration-300">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                        </svg>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">38.4k GitHub Stars</span>
                      </div>
                    </a>
                  </div>
                  <div className="jsx-c345af62d58e68d7 relative w-full h-[240px] sm:h-[500px] lg:h-[500px] overflow-hidden flex items-end">
                    <div className="w-full h-auto object-contain lottie-purple-filter">
                      {/* Team collaboration visualization */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-opacity-80 text-center">
                          <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#4B96DC] to-[#9f58fa] bg-clip-text text-transparent">Team Collaboration</div>
                          <div className="text-sm text-white text-opacity-60">Powered by AI assistance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{ bottom: '-35px', pointerEvents: 'none' }}
        className="jsx-11a741b70a9e08c4 absolute left-0 right-0 z-50 flex justify-center items-center transition-all duration-700 opacity-100 transform-none"
      >
        <div
          style={{ height: '300px', bottom: 0 }}
          className="jsx-11a741b70a9e08c4 absolute bottom-0 left-0 right-0 overflow-visible"
        ></div>
        <div
          style={{ pointerEvents: 'auto' }}
          className="jsx-11a741b70a9e08c4 relative w-[90%] max-w-[900px] h-[70px] animate-bounce-in cursor-pointer hover:brightness-110 transition-all duration-300"
        >

          <div className="jsx-11a741b70a9e08c4 absolute inset-0 flex justify-center items-center">
            <div
              style={{ transform: 'translateY(var(--text-y-offset, 0))' }}
              className="jsx-11a741b70a9e08c4 flex items-center text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold px-2"
            >
              <div className="jsx-11a741b70a9e08c4 flex items-center sm:hidden">
                <span className="jsx-11a741b70a9e08c4 mr-1">🎉</span>
                <span className="jsx-11a741b70a9e08c4">1 Million Installs! Thank You Devs</span>
                <span className="jsx-11a741b70a9e08c4 ml-1">🎉</span>
              </div>
              <div className="jsx-11a741b70a9e08c4 hidden sm:flex sm:items-center">
                <span className="jsx-11a741b70a9e08c4 mr-2">🎉</span>
                <span className="jsx-11a741b70a9e08c4">Thanking the Dev Community for 1 Million Installs!</span>
                <span className="jsx-11a741b70a9e08c4 ml-2">🎉</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
