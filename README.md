# Ditu

## Abstract

Ditu is a travel-specific social community platform that is a “one stop shop” for planning and sharing travel amongst friends and family. The application will consist of an interactive map delivered through a map API where countries will be color coded based on a combination of government travel advisories and visa requirements of the user’s inputted citizenship. Users can click on these countries to get detailed information on all travel statuses to that country which will be updated in real time. This info panel will also include basic country information such as population, languages, capital, etc. In future implementations, we hope to incorporate users’ social information by showing any reviews a user’s friends have left for that country. In addition, users will be able to create profiles that show a variety of information regarding their travel experiences such as the number of countries or continents visited and will be able to add other users as “friends” who will be able to see each other’s profiles. One of the main features that users can add to their profiles are “Itineraries” in which users will input upcoming flight information. When such itineraries are viewed by a user, the map will shift to show the flight paths for that itinerary. Using an aggregate of all itineraries on Ditu, users can look at a “heat map” showing the most populated flight paths at the current time for Ditu users. We also hope to add gamification through leaderboards and achievements where users can show the achievements they have acquired on their profile.

## Overview of Existing Systems

With leisure travel being more accessible than ever, people are sharing their travel experiences like never before on social media platforms such as Instagram, Facebook, Snapchat and YouTube. Despite this, there lacks a dedicated platform that allows people to exclusively share travel-related content while also presenting personal travel-related statistics.

Most existing travel apps allow users to plan out different aspects of their travel, including booking flights and hotels, creating itineraries, checking local weather conditions and recording statistics. For example, App in the Air keeps track of users’ itineraries, boarding passes and frequent-flier programs, and uses these preferences to recommend future flight and hotel options. App in the Air also features a social component by allowing users to connect with nearby fliers and to share information such as places visited and hours spent in the air. Although App in the Air provides check-in requirements and baggage tips, it does not provide information on travel restrictions or safety .

The Government of Canada offers a Travel Smart app which provides up-to-date information on entry and exit requirements for over 200 destinations worldwide. The Travel Smart app also includes information on local safety and security conditions as well as possible health hazards and restrictions. There is also emergency contact information for Canadian embassies and consulates abroad. However, the Travel Smart app’s clunky interface and poor user experience leaves a lot to be desired.

Ditu seeks to improve on existing travel apps by providing a cohesive user experience that combines the logistical and social aspects of travelling. Specifically, Ditu addresses the lack of a platform for people to share and exhibit their travel accolades while also providing tools to make travel plans more convenient. Our aim is to allow users to collaborate with friends and family on their travel plans by sharing upcoming travel dates and paths. We hope that our application can help avoid the situation of finding out belatedly that you were travelling in the same place at the same time as a friend. Everything considered, our target audience is any social media user that is keen on sharing travel-specific information.

## Epics and User Stories

As a potential traveller, I want to be able to gain information regarding travel destinations:
* I want to be able to see the destination’s basic information, such as its language, capital, etc.
* I want to be able to see entry and exit requirements for the country.
* I want to be able to see real-time news regarding the destination.
* I want to be able to see the reviews of other users regarding their visit to the area.

As a potential traveller, I want to gain knowledge of the security situation at potential destinations to make better informed decisions regarding my safety:
* I want to be able to see the general threat level within countries at a quick glance.
* I want to be able to see government advisories regarding security concerns.
* I want to be able to read reviews of other users who have visited to find areas to avoid or to not visit at all, depending on their comments.
 
As a social traveller, I want to have an overview of the places my friends and I have visited, for my own personal information and enjoyment:
* I want to be able to see a collection of my past itineraries, and to be able to see this in a simplified quick glance, such as in the form of arrows on a map.
* I want to be able to see my friends’ past travel destinations.
* I want to be able to see the most popular locations to visit for all app users.
* I want to be able to see the number of places my friends and I have gone, and to be able to compare these statistics with them.
* I want to be able to leave reviews on destinations I have gone to.
