INSTRUCTIONS/NOTES: When reviewing or aiming to resolve the above, reference the intended result from the original source (https://github.com/deckofdmthings/GameMasterAI) against the results we are seeing in our fork, and try to identify why there are any differences, before proposing any solutions. Prioritise parity with the source over adding new features or adjusting our own to 'work' and check with the user to confirm their wishes 'parity, adapt, improve, or recreate from scratch'.

From test_1:

1. ERROR: On the 'load game' tab of the webui, there is no data and an error message is present "An error occurred while loading the games."

2. BUG: The LLM is inserting initative test into the responses and revealing details of their thinking or potential outcomes within the response to the user.

3. BUG: The LLM is not treating the proposed actions of the user as a 'skill challenge', that requires an outcome to be decided, similar to how dice would be rolled to identify outcomes in a real game of DnD. No actions are actually being tested or resolved.

4. BUG: The notetaker window is not making succint notes on what happens, the content will not actually provide much if any benefit to a game in its current form.

5. BUG: The responses are still getting cut off.