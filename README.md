# SourceRPC

A Source Engine Discord Rich Presence implementation.

## How does this work?

It parses console dumps from the `condump` command to figure out the current game state.

## Can I get VAC banned?

No, since it never touches the games memory. It uses commands that are built-into the Source Engine.

## How do I use?

Change the settings to the game you want and the path to said game.
Settings should already contain an example. You can then run it with Node.JS

Next, make sure this is in your games autoexec file
```
alias update_rpc "clear; status; condump; clear"
```

You will have to run the previous command when the current Rich Presence is outdated
(i.e. joined another server, user left, etc.)
We recommend adding this to a key-bind for easy access.

This is still very early access, and currently only has guaranteed support for Left 4 Dead 2,
but I can't see why this wouldn't work on other Source Engine games.