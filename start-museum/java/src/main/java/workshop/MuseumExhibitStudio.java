package workshop;

// Museum Exhibit Studio — learner entrypoint.
//
// HOW TO EDIT THIS FILE
//
// Every place you write code is a named region between two marker lines:
//
//     >>> BEGIN <region> | Step 4: INSERT | Step 6: REPLACE
//     <<< END <region>
//
// The BEGIN line lists every step that touches the region. Each lesson block names its region
// and one of two actions:
//
//     INSERT   The region is empty. Paste the block between the two marker lines.
//     REPLACE  The region already has code. Delete everything between the two marker lines,
//              then paste the block.
//
// A block is always the complete contents of its region. Never edit, move, or delete a marker
// line, and leave the code outside the regions as it is.
//
// The pre-built curator helpers live beside this file as Curator*.java. Do not edit those files:
// they are the application-owned half of the workshop, and they must stay identical to the
// finished app's copy.

// >>> BEGIN imports | Step 1: INSERT | Steps 3-4, 6-7: REPLACE
// <<< END imports

public final class MuseumExhibitStudio {
    private MuseumExhibitStudio() {
    }

    public static void main(String[] args) {
        int exitCode = 0;
        try {
            run(args);
        } catch (Exception exception) {
            exitCode = 1;
            System.err.println(CuratorTerminal.describeFailure(exception));
        } finally {
            try {
                CuratorTerminal.close();
            } catch (Exception ignored) {
                // A failure to close standard input cannot change the outcome of the run, and the
                // run has already reported its own failure if it had one.
            }
        }
        if (exitCode != 0) {
            System.exit(exitCode);
        }
    }

    private static void run(String[] args) throws Exception {
        if (args.length != 0) {
            throw new IllegalArgumentException("Usage: ./mvnw compile exec:java");
        }

        // >>> BEGIN banner | Step 1: REPLACE
        System.out.println("=== Museum Exhibit Studio starter ===");
        System.out.println("Pre-built curator helpers are ready in src/main/java/workshop/.");
        System.out.println("Continue with museum step 1 to write your first curator session.");
        // <<< END banner

        // >>> BEGIN choose-facts | Step 4: INSERT
        // <<< END choose-facts

        // >>> BEGIN research | Step 6: INSERT
        // <<< END research

        // >>> BEGIN generate | Step 1: INSERT | Steps 2-6: REPLACE
        // <<< END generate

        // >>> BEGIN validate | Step 5: INSERT
        // <<< END validate

        // >>> BEGIN sources | Step 6: INSERT
        // <<< END sources

        // >>> BEGIN exhibit-page | Step 7: INSERT
        // <<< END exhibit-page
    }

    // >>> BEGIN exhibit-prompt | Step 4: INSERT | Step 6: REPLACE
    // <<< END exhibit-prompt

    // >>> BEGIN html-prompt | Step 7: INSERT
    // <<< END html-prompt

    // >>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
    // <<< END generation-config

    // >>> BEGIN research-config | Step 6: INSERT
    // <<< END research-config

    // >>> BEGIN html-config | Step 7: INSERT
    // <<< END html-config

    // >>> BEGIN session-runner | Step 4: INSERT
    // <<< END session-runner
}
