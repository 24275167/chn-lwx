-- 创建CATEGORY表
CREATE TABLE CATEGORY (
  CATEGORY_ID INT PRIMARY KEY AUTO_INCREMENT,
  NAME VARCHAR(100) NOT NULL
);
-- 创建FUNDRAISER表
CREATE TABLE FUNDRAISER (
  FUNDRAISER_ID INT PRIMARY KEY AUTO_INCREMENT,
  ORGANIZER VARCHAR(255) NOT NULL,
  CAPTION VARCHAR(255),
  TARGET_FUNDING DECIMAL(10, 2),
  CURRENT_FUNDING DECIMAL(10, 2) DEFAULT 0,
  CITY VARCHAR(100),
  ACTIVE BOOLEAN DEFAULT TRUE,
  CATEGORY_ID INT,
  FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORY(CATEGORY_ID)
);
CREATE TABLE DONATION (
    DONATION_ID INT AUTO_INCREMENT PRIMARY KEY,
    DATE DATETIME DEFAULT CURRENT_TIMESTAMP,
    AMOUNT DECIMAL(10, 2) NOT NULL,
    GIVER VARCHAR(255) NOT NULL,
    FUNDRAISER_ID INT,
    FOREIGN KEY (FUNDRAISER_ID) REFERENCES FUNDRAISER(FUNDRAISER_ID)
);
-- 添加CATEGORY数据
INSERT INTO CATEGORY (NAME) VALUES ('Health'), ('Education'),('Animal Welfare'), ('Environment'), ('Arts & Culture');
-- 添加FUNDRAISER数据
INSERT INTO FUNDRAISER (ORGANIZER, CAPTION, TARGET_FUNDING, CURRENT_FUNDING, CITY, ACTIVE, CATEGORY_ID) 
VALUES 
  ('Emily', 'Animal Rescue Mission Expansion', 10000, 6500, 'Adelaide', TRUE, 1),
  ('Ethan', 'Reforestation of Community Lands', 5000, 3200, 'Brisbane', TRUE, 2),
  ('Charlotte', 'Art Supplies for Youth Programs', 4000, 2900, 'Gold Coast', TRUE, 3),
  ('Harper', 'Clean Energy for Rural Schools', 16000, 13200, 'Hobart', TRUE, 5),
  ('Grace', 'Rebuilding Animal Shelter After Storm', 7000, 5000, 'Sydney', TRUE, 2),
  ('Chloe', 'Expand Wildlife Protection Area', 13000, 9300, 'Adelaide', TRUE, 5),
  ('Daniel', 'Fund for Community Green Spaces', 6000, 4500, 'Brisbane', TRUE, 4),
  ('Sofia', 'Support Local Music Festivals', 7000, 4800, 'Gold Coast', TRUE, 3),
  ('Ella', 'Clean Water Initiative for Drought Areas', 18000, 14500, 'Hobart', TRUE, 4),
  ('Ava', 'Library Resources for Children', 15000, 11200, 'Perth', TRUE, 1);

-- 添加数据
INSERT INTO DONATION (AMOUNT, GIVER, FUNDRAISER_ID) VALUES 
(100.00, 'Alice', 1), (50.00, 'Bob', 2), (200.00, 'Charlie', 3), 
(75.00, 'David', 4), (150.00, 'Emma', 5), (300.00, 'Frank', 6), 
(20.00, 'Grace', 7), (500.00, 'Hank', 8), (250.00, 'Isabel', 9), 
(120.00, 'Jack', 10), (60.00, 'Karen', 1), (80.00, 'Leo', 2), 
(90.00, 'Mona', 3), (45.00, 'Nina', 4);