INSERT INTO users (
    id,
    type,
    email,
    "firstName",
    "lastName",
    password,
    "passwordUpdatedAt",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES 
-- Driver users
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'driver',
    'john.driver@example.com',
    'John',
    'Smith',
    '$2b$10$rKvK8QIkHZQGWjQhKQGQKOeZvZQQZQQZQQZQQZQQZQQZQQZQQZQQZ', -- hashed password
    NOW(),
    true,
    NOW(),
    NOW()
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'driver',
    'sarah.driver@example.com',
    'Sarah',
    'Johnson',
    '$2b$10$rKvK8QIkHZQGWjQhKQGQKOeZvZQQZQQZQQZQQZQQZQQZQQZQQZQQZ', -- hashed password
    NOW(),
    true,
    NOW(),
    NOW()
),
-- Carrier users
(
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'carrier',
    'mike.carrier@example.com',
    'Mike',
    'Williams',
    '$2b$10$rKvK8QIkHZQGWjQhKQGQKOeZvZQQZQQZQQZQQZQQZQQZQQZQQZQQZ', -- hashed password
    NOW(),
    true,
    NOW(),
    NOW()
),
(
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'carrier',
    'emma.carrier@example.com',
    'Emma',
    'Brown',
    '$2b$10$rKvK8QIkHZQGWjQhKQGQKOeZvZQQZQQZQQZQQZQQZQQZQQZQQZQQZ', -- hashed password
    NOW(),
    true,
    NOW(),
    NOW()
),
-- Owner users
(
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'owner',
    'david.owner@example.com',
    'David',
    'Davis',
    '$2b$10$rKvK8QIkHZQGWjQhKQGQKOeZvZQQZQQZQQZQQZQQZQQZQQZQQZQQZ', -- hashed password
    NOW(),
    true,
    NOW(),
    NOW()
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'owner',
    'lisa.owner@example.com',
    'Lisa',
    'Wilson',
    '$2b$10$rKvK8QIkHZQGWjQhKQGQKOeZvZQQZQQZQQZQQZQQZQQZQQZQQZQQZ', -- hashed password
    NOW(),
    false, -- inactive user example
    NOW(),
    NOW()
);





ALTER TABLE payments REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;