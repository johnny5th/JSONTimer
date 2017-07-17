-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: mariadb
-- Generation Time: Jul 17, 2017 at 07:40 PM
-- Server version: 10.1.22-MariaDB-1~jessie
-- PHP Version: 7.0.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `jsontimer`
--

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `id` int(10) UNSIGNED NOT NULL,
  `startTime` datetime NOT NULL,
  `stopTime` datetime NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `tid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=COMPACT;

--
-- Dumping data for table `log`
--

INSERT INTO `log` (`id`, `startTime`, `stopTime`, `description`, `tid`) VALUES
(2, '2017-07-14 14:10:03', '2017-07-14 14:10:28', '', 6),
(3, '2017-07-14 14:15:19', '2017-07-14 14:16:41', '', 6),
(4, '2017-07-14 14:16:56', '2017-07-14 14:17:05', '', 6),
(5, '2017-07-14 14:18:35', '2017-07-14 14:18:42', '', 6);

-- --------------------------------------------------------

--
-- Table structure for table `timers`
--

CREATE TABLE `timers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `apiKey` varchar(255) NOT NULL,
  `running` tinyint(1) NOT NULL,
  `startTime` datetime NOT NULL,
  `uid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `timers`
--

INSERT INTO `timers` (`id`, `name`, `apiKey`, `running`, `startTime`, `uid`) VALUES
(6, 'Johnny\'s Key', 'edea4ec1-e2ab-4af4-8895-be815cabc30e', 1, '2017-07-14 17:37:17', 1),
(8, 'bob', 'ac99e379-ba50-460e-bdf9-99e0dbed2050', 0, '0000-00-00 00:00:00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `githubId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `githubId`) VALUES
(1, 'johnny@johnny5th.com', 1295771);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timers`
--
ALTER TABLE `timers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `apiKey` (`apiKey`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `githubId` (`githubId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `timers`
--
ALTER TABLE `timers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
