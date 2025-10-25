package com.tobias.blackjack.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Web Controller for serving static pages
 */
@Controller
public class WebController {

    /**
     * Serve the main game page at root URL
     */
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
}
