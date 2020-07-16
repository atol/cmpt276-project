import scrapy

class TravelItem(scrapy.Item):
    country = scrapy.Field()
    advisory = scrapy.Field()
    updated = scrapy.Field()
    link = scrapy.Field()
    risk = scrapy.Field()
    security = scrapy.Field()
    entryexit = scrapy.Field()
    health = scrapy.Field()
    laws = scrapy.Field()
    disasters = scrapy.Field()
    assistance = scrapy.Field()

class TravelSpider(scrapy.Spider):
    name = "travel_spider"
    allowed_domains = ["travel.gc.ca"]
    start_urls = ['https://travel.gc.ca/travelling/advisories']

    def parse(self, response):
        for item in self.scrape(response):
            yield item

    def scrape(self, response):
        for resource in response.xpath("//tr[@class='gradeX']"):
            item = TravelItem()

            item['country'] = resource.xpath("td/a/text()").extract_first()
            item['updated'] = resource.xpath("td[4]/text()").extract_first()

            country_page = response.urljoin(resource.xpath("td/a/@href").extract_first())
            item['link'] = country_page

            request = scrapy.Request(country_page, callback=self.get_details)
            request.meta['item'] = item

            yield request

    def get_details(self, response):
        item = response.meta['item']

        item['advisory'] = response.xpath("//a[@class='wb-lbx']/text()").extract_first()
        item['risk'] = response.xpath("//details[@id='risk']").extract()
        item['security'] = response.xpath("//details[@id='security']").extract()
        item['entryexit'] = response.xpath("//details[@id='entryexit']").extract()
        item['health'] = response.xpath("//details[@id='health']").extract()
        item['laws'] = response.xpath("//details[@id='laws']").extract()
        item['disasters'] = response.xpath("//details[@id='disasters']").extract()
        item['assistance'] = response.xpath("//details[@id='assistance']").extract()
        
        yield item