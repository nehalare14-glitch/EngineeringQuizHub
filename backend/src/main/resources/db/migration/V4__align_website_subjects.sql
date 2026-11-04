DELETE FROM subjects;

INSERT INTO subjects (branch_id, name)
SELECT b.id, s.name
FROM (
    VALUES
    ('CSE', 'Programming'),
    ('CSE', 'Data Structures'),
    ('CSE', 'Database Management'),
    ('CSE', 'Computer Networks'),
    ('CSE', 'Operating Systems'),

    ('ECE', 'Digital Electronics'),
    ('ECE', 'Analog Electronics'),
    ('ECE', 'Communication Systems'),
    ('ECE', 'Microprocessors'),

    ('EEE', 'Circuit Theory'),
    ('EEE', 'Electrical Machines'),
    ('EEE', 'Power Systems'),
    ('EEE', 'Control Systems'),

    ('MECH', 'Engineering Mechanics'),
    ('MECH', 'Thermodynamics'),
    ('MECH', 'Manufacturing'),
    ('MECH', 'Machine Design'),

    ('CIVIL', 'Surveying'),
    ('CIVIL', 'Structural Engineering'),
    ('CIVIL', 'Building Materials'),
    ('CIVIL', 'Environmental Engineering'),

    ('AIML', 'Python for AI'),
    ('AIML', 'Machine Learning'),
    ('AIML', 'Deep Learning'),
    ('AIML', 'Neural Networks'),
    ('AIML', 'Natural Language Processing'),
    ('AIML', 'Generative AI')
) AS s(branch_code, name)
JOIN branches b ON b.code = s.branch_code;
