import React from 'react';
import { useLoading } from '../hooks/useLoading';

const Loader = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="global-loader-overlay">
      <div className="newtons-cradle">
        <div className="newtons-cradle__dot"></div>
        <div className="newtons-cradle__dot"></div>
        <div className="newtons-cradle__dot"></div>
        <div className="newtons-cradle__dot"></div>
      </div>
      <p className="loader-text">Synchronizing Ledger...</p>

      <style jsx="true">{`
        .global-loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }

        .loader-text {
          margin-top: 24px;
          color: var(--primary);
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 2px;
          font-size: 14px;
          text-transform: uppercase;
          opacity: 0.8;
          animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* From Uiverse.io by dovatgabriel */ 
        .newtons-cradle {
          --uib-size: 80px;
          --uib-speed: 1.2s;
          --uib-color: var(--primary);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--uib-size);
          height: var(--uib-size);
        }

        .newtons-cradle__dot {
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
          width: 25%;
          transform-origin: center top;
        }

        .newtons-cradle__dot::after {
          content: '';
          display: block;
          width: 100%;
          height: 25%;
          border-radius: 50%;
          background-color: var(--uib-color);
          box-shadow: 0 0 20px var(--primary);
        }

        .newtons-cradle__dot:first-child {
          animation: swing var(--uib-speed) linear infinite;
        }

        .newtons-cradle__dot:last-child {
          animation: swing2 var(--uib-speed) linear infinite;
        }

        @keyframes swing {
          0% {
            transform: rotate(0deg);
            animation-timing-function: ease-out;
          }

          25% {
            transform: rotate(70deg);
            animation-timing-function: ease-in;
          }

          50% {
            transform: rotate(0deg);
            animation-timing-function: linear;
          }
        }

        @keyframes swing2 {
          0% {
            transform: rotate(0deg);
            animation-timing-function: linear;
          }

          50% {
            transform: rotate(0deg);
            animation-timing-function: ease-out;
          }

          75% {
            transform: rotate(-70deg);
            animation-timing-function: ease-in;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
