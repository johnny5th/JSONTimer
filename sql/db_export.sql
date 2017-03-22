-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: mariadb
-- Generation Time: Mar 22, 2017 at 01:47 AM
-- Server version: 10.1.22-MariaDB-1~jessie
-- PHP Version: 7.0.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `jsontimer`
--

-- --------------------------------------------------------

--
-- Table structure for table `timerKeys`
--

CREATE TABLE `timerKeys` (
  `keyid` int(11) NOT NULL,
  `timerkey` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `timerLog`
--

CREATE TABLE `timerLog` (
  `logid` int(10) UNSIGNED NOT NULL,
  `start` datetime NOT NULL,
  `stop` datetime NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `timerKey` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=COMPACT;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `timerKeys`
--
ALTER TABLE `timerKeys`
  ADD PRIMARY KEY (`keyid`);

--
-- Indexes for table `timerLog`
--
ALTER TABLE `timerLog`
  ADD PRIMARY KEY (`logid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `timerKeys`
--
ALTER TABLE `timerKeys`
  MODIFY `keyid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `timerLog`
--
ALTER TABLE `timerLog`
  MODIFY `logid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
