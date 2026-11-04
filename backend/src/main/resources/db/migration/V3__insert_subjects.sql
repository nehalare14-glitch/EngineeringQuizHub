INSERT INTO subjects (branch_id, name)
SELECT b.id, s.name
FROM (
    VALUES
    ('CSE', 'C Programming'),
    ('CSE', 'Python Programming'),
    ('CSE', 'Java Programming'),
    ('CSE', 'Data Structures'),
    ('CSE', 'Database Management Systems'),
    ('CSE', 'Operating Systems'),
    ('CSE', 'Computer Networks'),
    ('CSE', 'Web Technologies'),

    ('ECE', 'Electronic Devices'),
    ('ECE', 'Digital Electronics'),
    ('ECE', 'Analog Circuits'),
    ('ECE', 'Communication Systems'),
    ('ECE', 'Microprocessors'),
    ('ECE', 'Embedded Systems'),

    ('EEE', 'Electrical Circuits'),
    ('EEE', 'Electrical Machines'),
    ('EEE', 'Power Systems'),
    ('EEE', 'Control Systems'),
    ('EEE', 'Power Electronics'),
    ('EEE', 'Electrical Measurements'),

    ('MECH', 'Engineering Mechanics'),
    ('MECH', 'Thermodynamics'),
    ('MECH', 'Fluid Mechanics'),
    ('MECH', 'Manufacturing Technology'),
    ('MECH', 'Machine Design'),
    ('MECH', 'CAD/CAM'),

    ('CIVIL', 'Surveying'),
    ('CIVIL', 'Structural Analysis'),
    ('CIVIL', 'Building Materials'),
    ('CIVIL', 'Concrete Technology'),
    ('CIVIL', 'Geotechnical Engineering'),
    ('CIVIL', 'Transportation Engineering'),

    ('AIML', 'Python for AI'),
    ('AIML', 'Mathematics for AI'),
    ('AIML', 'Machine Learning'),
    ('AIML', 'Deep Learning'),
    ('AIML', 'Data Science'),
    ('AIML', 'Natural Language Processing')
) AS s(branch_code, name)
JOIN branches b ON b.code = s.branch_code;
