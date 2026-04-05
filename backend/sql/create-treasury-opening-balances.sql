-- Table pour le report de trésorerie (alignée sur TreasuryOpeningBalance)
CREATE TABLE IF NOT EXISTS treasury_opening_balances (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
