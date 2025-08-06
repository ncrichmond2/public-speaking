import React from "react";
import styled from "styled-components";

const BrandedCard = ({ title, text, color = "#2d9cfc" }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="bg">
          <div className="content">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        </div>
        <div className="blob" style={{ backgroundColor: color }} />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 0 auto;

  .card {
    position: relative;
    height: 260px;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    /* 🧼 Clean shadow for white bg */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);

    /* ✅ New subtle border to separate cards */
    border: 1px solid rgba(0, 0, 0, 0.04);

    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    }
  }

  .bg {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(24px);
    border-radius: 10px;

    /* ✅ Adds inner "highlight ring" */
    outline: 1px solid rgba(255, 255, 255, 0.9);

    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    padding: 1rem;
    text-align: center;
  }

  .content {
    z-index: 3;
  }

  .content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e3a8a;
  }

  .content p {
    font-size: 0.95rem;
    color: #333;
  }

  .blob {
    position: absolute;
    z-index: 1;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    opacity: 0.75;
    filter: blur(10px);
    animation: blob-orbit 10s linear infinite;
    pointer-events: none;
  }

  @keyframes blob-orbit {
    0% {
      top: 0%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    25% {
      top: 50%;
      left: 100%;
      transform: translate(-50%, -50%);
    }
    50% {
      top: 100%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    75% {
      top: 50%;
      left: 0%;
      transform: translate(-50%, -50%);
    }
    100% {
      top: 0%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`;

export default BrandedCard;

