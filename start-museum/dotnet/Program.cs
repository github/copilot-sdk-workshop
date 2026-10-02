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
// The pre-built curator helpers live in Helpers/. Do not edit those files: they are the
// application-owned half of the workshop, and they must stay identical to the finished app's copy.

// >>> BEGIN imports | Steps 1, 6: REPLACE
using MuseumExhibitStudio.Helpers;
// <<< END imports

// >>> BEGIN curator-system-message | Step 3: INSERT | Step 6: REPLACE
// <<< END curator-system-message

// >>> BEGIN research-system-message | Step 6: INSERT
// <<< END research-system-message

try
{
    // >>> BEGIN banner | Step 1: REPLACE
    Console.WriteLine("=== Museum Exhibit Studio starter ===");
    Console.WriteLine("Pre-built curator helpers are ready in Helpers/.");
    Console.WriteLine("Continue with museum step 1 to write your first curator session.");
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

    return 0;
}
catch (Exception exception)
{
    Console.Error.WriteLine(CuratorTerminal.DescribeFailure(exception));
    return 1;
}
finally
{
    CuratorTerminal.CloseTerminal();
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
