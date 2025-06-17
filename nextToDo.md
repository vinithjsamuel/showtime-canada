1- As a user, I want to view a list of event categories, so that I can choose one to explore.
This user story focuses on allowing users to browse a list of categorized events to streamline discovery and improve navigation. Presenting events in clear, structured categories enables users to easily find events of interest and enhances their overall experience on the Showtime Canada platform.

Acceptance Criteria:

Given a user is on the events homepage, when they access the events section, then a list of all event categories is displayed.

Given a user is viewing the list of event categories, when they click on a category, then they are taken to a page that lists all events under that category.

Given a user is viewing event categories, when there are no events available in a particular category, then a message such as "No events available in this category" is displayed.

Given a user is on the events page, when categories are displayed, then they should include an icon or brief description to help users understand the type of events.



2- As a user, I want to select a category (e.g., Movies, Music), so that I only see events of that type.
This user story focuses on providing users the ability to filter events by category, such as Movies, Music, or others. This ensures a more personalized browsing experience by displaying only the events that align with their interests, helping them discover relevant events more efficiently on Showtime Canada.

Acceptance Criteria:
Given a user is on the events category page, when they select a specific category (e.g., Movies or Music), then only the events under that selected category are displayed.

Given a user has selected a category, when they return to the event listings page, then their last selected category should remain selected (unless they manually change it).

Given a user selects a category with no upcoming events, then a message such as "No events available in this category" should be shown.

Given a user wants to reset the category selection, when they click on a “Clear Filter” or “All Categories” option, then events from all categories should be displayed again.

3- As a user, I want to set my city or location, so that I only see events happening near me.
This user story focuses on enabling users to personalize their event browsing experience by setting their city or location. By filtering events based on geography, users can quickly discover relevant events that are physically accessible, improving both engagement and satisfaction with the Showtime Canada platform.

Acceptance Criteria:
Given a user is on the events page, when they set their city or location, then only events that are happening in or near that location are displayed.

Given a user has set a location, when they revisit the platform, then the previously selected location is remembered and applied by default.

Given a user has set a location, when there are no events in that area, then a message such as "No events available in your area" is shown.

Given a user wants to change their city or location, when they click on the location selector, then they should be able to update it and see events updated accordingly.

Given a user does not set any location, then the system should default to a national or "All Locations" view of events.

4- As a user, I want to change my location manually, so that I can check events in other cities.
This user story enables users to manually override their current location to explore events in other cities. This feature is useful for users who are planning to travel, exploring upcoming events elsewhere, or simply browsing out of curiosity. It enhances flexibility and gives users greater control over their event discovery experience on the Showtime Canada platform.

Acceptance Criteria:
Given a user is on the events page, when they click on the location selector, then they can manually enter or choose a different city from a dropdown or search field.

Given a user selects a different city manually, then events from that city are displayed immediately.

Given a user manually changes their location, when they revisit the platform, then the manually selected city should remain unless changed again.

Given a user enters an invalid or unsupported city, then an appropriate message such as “No events found in this location” or “Invalid city” is displayed.

Given a user has changed their location manually, when they want to return to their original location, then they can either clear the selection or select their current city from the list.