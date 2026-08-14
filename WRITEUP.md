# Write-up

## What was built

- a lightweight personal budget app with focus on accessibility and ease of use, keeping it single page with a minimal but clean presentation

## AI usage

### Tool used

- Github Copilot

### Used for

- used for much of the logic as both the job posting and the instructions on the exercise seem to stress that AI is expected to be used heavily or at least frequently in ways that speed up the process
- AI was given explicit instructions throughout as I wanted to drive the decisions rather than just give it vague overviews and let it steer the direction

### Areas of challege with the AI

- the AI did not always consider readability and separation of concerns with it's coding choices, resulting in me having to specify certain sections that would work better as separate components/files rather than having everything crammed into one file; my goal was to keep the files at roughly 200-300 lines of code or less for improved readability
- the AI did not always consider accessibility, resulting in me having to specify certain areas where accessibility was a priority (like having the tables be scrollable by keyboard control)
- the AI did not always make the best styling choices, resulting in me tweaking the CSS for improved margins/padding, contrast, and placement of items

## My enhancements

- I noticed that the instructions did not specify filtering by date or amount, so I added that because it makes sense from a user standpoint
- similarly I noticed the instructions only had search looking based on the description text, but I felt it was a better user experience to have it filter on all available information, so I added it
- in the instructions I did not see a mention of adding a way for a user to modify an entry, but that is an important feature that can prevent users from having to delete and replace entire entries if they made a mistake, so I added that
- the biggest feature I added is a list at the bottom that shows the percentage of each expense (by category) and what percentage of income remains, because it would help the user understand spending habits and where they could be spending too much based on a clear understandable percentage vs having to go through everything in the table to find that information on their own

## What I would do next with more time

- change the tables shown to something more mobile friendly on smaller screens while leaving them tables on larger screens. Tables are clean and easy to read on larger screens, but become difficult on mobile devices.
- add something to help the user apply this information for tax purposes. I'm not sure exactly what this would look like, but I'm thinking along the lines of being able to pull information on donations, business spending, and things along those lines with guidance on where on state and federal taxes to utilize the information. I'm not a tax expert, so this would require a lot more research for the requirements, but would be useful to the user
