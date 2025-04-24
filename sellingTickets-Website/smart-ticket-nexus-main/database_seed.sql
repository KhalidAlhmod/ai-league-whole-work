
-- Database Schema for SmartTicket

-- Create Users Table
CREATE TABLE users (
  user_id        SERIAL PRIMARY KEY,
  full_name      VARCHAR(100) NOT NULL,
  national_id    VARCHAR(20),
  visa_id        VARCHAR(20),
  is_local       BOOLEAN NOT NULL,
  email          VARCHAR(100) UNIQUE NOT NULL,
  phone          VARCHAR(20) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  team_supported VARCHAR(50),
  is_admin       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Events Table
CREATE TABLE events (
  event_id   SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  date_time  TIMESTAMP NOT NULL,
  location   VARCHAR(100) NOT NULL,
  team_1     VARCHAR(50),
  team_2     VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tickets Table
CREATE TABLE tickets (
  ticket_id      SERIAL PRIMARY KEY,
  event_id       INT REFERENCES events(event_id) ON DELETE CASCADE,
  owner_user_id  INT REFERENCES users(user_id) ON DELETE CASCADE,
  purchase_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_resold      BOOLEAN DEFAULT FALSE,
  resale_count   INT DEFAULT 0,
  price          DECIMAL(10,2) NOT NULL,
  is_active      BOOLEAN DEFAULT TRUE
);

-- Create Transactions Table
CREATE TABLE transactions (
  transaction_id   SERIAL PRIMARY KEY,
  ticket_id        INT REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  buyer_user_id    INT REFERENCES users(user_id) ON DELETE CASCADE,
  seller_user_id   INT REFERENCES users(user_id),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  price            DECIMAL(10,2) NOT NULL,
  payment_status   VARCHAR(20) DEFAULT 'paid'
);

-- Row Level Security Policies

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_self_read ON users
  FOR SELECT
  USING (auth.uid() = email);

CREATE POLICY users_self_update ON users
  FOR UPDATE
  USING (auth.uid() = email);

-- Events policies
CREATE POLICY events_read_all ON events
  FOR SELECT
  TO PUBLIC;

CREATE POLICY events_admin_insert ON events
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE email = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY events_admin_update ON events
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE email = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY events_admin_delete ON events
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE email = auth.uid() AND is_admin = TRUE
  ));

-- Tickets policies
CREATE POLICY tickets_read_active ON tickets
  FOR SELECT
  TO PUBLIC
  USING (is_active = TRUE);

CREATE POLICY tickets_read_own ON tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.uid() AND user_id = owner_user_id
    )
  );

CREATE POLICY tickets_update_own ON tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.uid() AND user_id = owner_user_id
    )
  );

-- Transactions policies
CREATE POLICY transactions_read_own ON transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.uid() AND user_id IN (buyer_user_id, seller_user_id)
    )
  );

-- Stored procedure for purchasing a ticket
CREATE OR REPLACE FUNCTION purchase_ticket(
  p_ticket_id INT,
  p_buyer_id INT,
  p_seller_id INT,
  p_price DECIMAL(10,2)
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO transactions (
    ticket_id,
    buyer_user_id,
    seller_user_id,
    price
  ) VALUES (
    p_ticket_id,
    p_buyer_id,
    p_seller_id,
    p_price
  );

  -- Update ticket ownership and status
  UPDATE tickets
  SET
    owner_user_id = p_buyer_id,
    is_resold = TRUE,
    resale_count = resale_count + CASE WHEN is_resold THEN 1 ELSE 0 END,
    purchase_date = NOW(),
    is_active = TRUE
  WHERE
    ticket_id = p_ticket_id;
END;
$$ LANGUAGE plpgsql;

-- Sample Data (uncomment and modify as needed)

-- Admin user
-- INSERT INTO users (full_name, email, is_local, national_id, phone, password_hash, is_admin)
-- VALUES ('Admin User', 'admin@smartticket.com', TRUE, '1000000001', '+966501234567', 'placeholder_hash', TRUE);

-- Regular users
-- INSERT INTO users (full_name, email, is_local, national_id, visa_id, phone, password_hash, team_supported)
-- VALUES
--   ('John Doe', 'john@example.com', TRUE, '1000000002', NULL, '+966501234568', 'placeholder_hash', 'Al-Hilal'),
--   ('Jane Smith', 'jane@example.com', FALSE, NULL, 'V12345678', '+1234567890', 'placeholder_hash', 'Al-Nassr');

-- Events
-- INSERT INTO events (name, date_time, location, team_1, team_2)
-- VALUES
--   ('Football Match', '2023-12-15 19:00:00', 'King Fahd Stadium', 'Al-Hilal', 'Al-Nassr'),
--   ('Basketball Tournament', '2023-12-20 18:30:00', 'Sports City Arena', 'Team A', 'Team B'),
--   ('Concert', '2023-12-25 20:00:00', 'Riyadh Season Zone', NULL, NULL);
