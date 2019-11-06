CREATE DATABASE IF NOT EXISTS theta;

USE theta;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT(5) AUTO_INCREMENT,
    `username` VARCHAR(128) NOT NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE (username)
) AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `events` (
    `id` INT(5) AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `shortDesc` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `date` VARCHAR(255) NOT NULL,
    `time` VARCHAR(255) NOT NULL,
    `capacity` INT(5) NOT NULL,
    `price` DECIMAL(9, 2) NOT NULL,
    `promoCode` VARCHAR(255) NULL,
    `username` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`)
) AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `attendees` (
    `id` INT(5) AUTO_INCREMENT,
    `eventId` INT(5) NOT NULL,
    `userId` INT(5) NOT NULL,
    `date` DATE NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (eventId) REFERENCES events(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE (`eventId`, `userId`)
) AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `activity` (
    `id` INT(5) AUTO_INCREMENT,
    `userId` INT(5) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `date` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (userId) REFERENCES users(id)
) AUTO_INCREMENT=1;