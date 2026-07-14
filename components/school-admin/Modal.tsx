import { ReactNode } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(8, 28, 33, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.ledgerRaised};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  padding: 28px;
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
`;

const Title = styled.h3`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
`;

const Close = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.inkFaint};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.ink};
  }
`;

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <Overlay onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Sheet role="dialog" aria-modal="true" aria-label={title}>
        <Head>
          <Title>{title}</Title>
          <Close aria-label="Close" onClick={onClose}>
            ×
          </Close>
        </Head>
        {children}
      </Sheet>
    </Overlay>
  );
}

export const FormField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.inkMuted};
  margin-bottom: 16px;

  input,
  select {
    font-family: ${({ theme }) => theme.font.body};
    font-size: 14px;
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.radius.sm};
    border: 1px solid ${({ theme }) => theme.colors.ledgerLine};
    color: ${({ theme }) => theme.colors.ink};
    background: ${({ theme }) => theme.colors.ledger};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.reef};
    }
  }
`;
