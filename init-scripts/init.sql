CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    res INTEGER NOT NULL,
    speed INTEGER NOT NULL
);

INSERT INTO items (name, description, hp, atk, res, speed) VALUES
('Excalibur', 'The legendary sword of King Arthur.', 50, 100, 20, 10),
('Mjolnir', 'Thor''s hammer, capable of leveling mountains.', 20, 150, 30, 5),
('Gungnir', 'Odin''s spear, which never misses its target.', 10, 120, 10, 20),
('Aegis', 'A shield bearing the head of Medusa, granting protection to its wielder.', 200, 0, 100, -10),
('Dragon Scale Shield', 'A shield crafted from the scales of an ancient dragon.', 150, 10, 80, -5),
('Boots of Speed', 'Magical boots that grant the wearer incredible swiftness.', 5, 0, 5, 50),
('Ring of Power', 'A plain gold ring that holds immense power.', 1000, 1000, 1000, 1000),
('Staff of the Magi', 'A powerful staff that can absorb and redirect magical energy.', 30, 10, 50, 15),
('Vorpal Blade', 'A blade that goes "snicker-snack!" and is sharp enough to decapitate on a critical hit.', 10, 80, 5, 25),
('Sunfire Cape', 'A cape that immolates nearby enemies.', 100, 20, 40, 0);
