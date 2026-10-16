package com.fixboard.config;

import com.fixboard.model.ChoreRequest;
import com.fixboard.model.Comment;
import com.fixboard.repository.ChoreRequestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ChoreRequestRepository repository;

    public DataInitializer(ChoreRequestRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        long now = System.currentTimeMillis();

        // 1. Catalog duplicate detection
        ChoreRequest req1 = new ChoreRequest(
                "Auto-detect & merge duplicate SKUs across Amazon, Shopify, and eBay",
                "Every week I spend 3+ hours manually cross-referencing SKUs between my Amazon Seller Central, Shopify store, and eBay listings. Duplicates slip in because each platform generates its own IDs. I need a tool that scans all three catalogs, flags duplicates by UPC/EAN/title similarity, and lets me merge them with one click — keeping the best images, descriptions, and pricing from each.",
                "catalog", 5, 2500L, 1875L, 347, "funded", "Maya Chen",
                Arrays.asList("Amazon", "Shopify", "eBay"), now - (86400000L * 12), 42
        );
        req1.addComment(new Comment("Jake R.", "This is literally my #1 time sink. Take my money.", now - (86400000L * 10)));
        req1.addComment(new Comment("Priya S.", "Would love if it also handled ASIN matching!", now - (86400000L * 8)));

        // 2. Returns analysis
        ChoreRequest req2 = new ChoreRequest(
                "Automated return reason analysis with refund recommendation",
                "My return rate is ~8% and I have zero visibility into patterns. I need something that pulls return reasons from Amazon and Shopify, categorizes them (sizing, defect, wrong item, buyer's remorse), and recommends whether to auto-refund, request photos, or dispute. Right now I handle each one manually and it takes 1-2 hours daily.",
                "returns", 4, 3000L, 900L, 256, "open", "Ravi Kumar",
                Arrays.asList("Amazon", "Shopify"), now - (86400000L * 8), 23
        );
        req2.addComment(new Comment("Lisa M.", "If this could generate reports for suppliers that would be amazing", now - (86400000L * 6)));

        // 3. Inventory sync
        ChoreRequest req3 = new ChoreRequest(
                "Real-time inventory sync that actually works across 4+ channels",
                "I sell on Amazon, Walmart, Shopify, and Etsy. Every existing sync tool I've tried has a 15-30 minute delay, which leads to overselling. I need sub-60-second inventory sync with automatic quantity reservation when an order comes in on any channel. Bonus: handle bundle/kit inventory deduction correctly.",
                "sync", 5, 5000L, 4200L, 489, "in-progress", "Sam Torres",
                Arrays.asList("Amazon", "Walmart", "Shopify", "Etsy"), now - (86400000L * 20), 67
        );
        req3.addComment(new Comment("Dev Team", "We're building this! Alpha testing starts next month.", now - (86400000L * 3)));
        req3.addComment(new Comment("Kim L.", "The bundle handling is critical. Don't ship without it!", now - (86400000L * 5)));
        req3.addComment(new Comment("Omar B.", "Been waiting for this for 2 years. Finally.", now - (86400000L * 7)));

        // 4. Listing errors
        ChoreRequest req4 = new ChoreRequest(
                "Bulk listing error fixer with AI-suggested corrections",
                "Amazon suppresses my listings for minor issues — wrong bullet point format, missing keywords, image size violations. I get 50+ errors a week and fixing each one takes 5-10 minutes because I have to figure out what's wrong. I want a dashboard that shows all listing errors, explains the fix in plain English, and auto-applies corrections with one click.",
                "listings", 4, 2000L, 450L, 198, "open", "Elena Popov",
                Arrays.asList("Amazon"), now - (86400000L * 5), 15
        );

        // 5. Pricing repricer
        ChoreRequest req5 = new ChoreRequest(
                "Competitor price tracker with smart repricing rules",
                "I need to monitor competitor pricing across Amazon and Walmart without paying $300/mo for existing tools. Simple rules: match lowest price minus $0.01, but never go below my cost + 15% margin. Alert me when a competitor drops below my floor so I can decide whether to compete or hold.",
                "pricing", 3, 1500L, 1500L, 312, "solved", "David Park",
                Arrays.asList("Amazon", "Walmart"), now - (86400000L * 30), 38
        );
        req5.addComment(new Comment("Builder Bot", "Solution shipped! Check the integrations page.", now - (86400000L * 2)));

        // 6. Shipping carrier comparison
        ChoreRequest req6 = new ChoreRequest(
                "Automated shipping label comparison across carriers",
                "Every day I compare rates between USPS, UPS, FedEx, and DHL for 50-100 packages. The existing tools (Pirate Ship, ShipStation) work but don't let me set conditional rules like 'use FedEx for oversized, USPS for <1lb, cheapest for everything else.' I want rules-based auto-selection with batch label printing.",
                "shipping", 3, 1800L, 720L, 167, "open", "Ashley Kim",
                Arrays.asList("Shopify", "Amazon"), now - (86400000L * 3), 19
        );
        req6.addComment(new Comment("Marcus T.", "Add regional carrier support (OnTrac, LSO) and I'm in!", now - (86400000L * 1)));

        // 7. Product photos & mockups
        ChoreRequest req7 = new ChoreRequest(
                "Product photo background remover & lifestyle mockup generator",
                "I source products from wholesalers and their photos are terrible. I need a tool that removes backgrounds, adds clean white backgrounds for Amazon compliance, AND generates lifestyle mockup images (product on a desk, in a kitchen, etc.) using AI. Existing tools do removal but not the mockups.",
                "listings", 2, 1200L, 360L, 134, "open", "Jenna Foster",
                Arrays.asList("Amazon", "Shopify", "Etsy"), now - (86400000L * 7), 12
        );

        // 8. Review aggregator
        ChoreRequest req8 = new ChoreRequest(
                "Cross-marketplace review aggregator & response bot",
                "I want one dashboard showing reviews from all my channels. Bad reviews get auto-flagged, and I can respond from one place. Bonus: detect fake competitor reviews and auto-report them.",
                "other", 3, 2200L, 550L, 145, "open", "Carlos Reyes",
                Arrays.asList("Amazon", "Walmart", "eBay"), now - (86400000L * 6), 14
        );
        req8.addComment(new Comment("Nina W.", "The fake review detection alone is worth the money.", now - (86400000L * 4)));

        repository.saveAll(Arrays.asList(req1, req2, req3, req4, req5, req6, req7, req8));
    }
}
