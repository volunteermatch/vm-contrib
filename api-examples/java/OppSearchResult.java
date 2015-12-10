
import java.util.*;

/**
 * Class to represent the results returned from an API call to "searchOpportunities". This class is
 * used to take the JSON string returned from the call and represent it as Java objects.
 *
 * Limitations: Currently not all possible fields are represented here. Only the ones currently needed
 * by the simple SearchOpportunitiesExample example.
 *
 * Created by jrackwitz on 12/3/15.
 */
public class OppSearchResult {
  private Integer currentPage;
  private ArrayList<Opportunities> opportunities;
  private Integer resultsSize;
  private String sortCriteria;

  public Integer getCurrentPage() {
    return currentPage;
  }

  public void setCurrentPage(Integer currentPage) {
    this.currentPage = currentPage;
  }

  public ArrayList<Opportunities> getOpportunities() {
    return opportunities;
  }

  public void setOpportunities(ArrayList<Opportunities> opportunities) {
    this.opportunities = opportunities;
  }

  public Integer getResultsSize() {
    return resultsSize;
  }

  public void setResultsSize(Integer resultsSize) {
    this.resultsSize = resultsSize;
  }

  public String getSortCriteria() {
    return sortCriteria;
  }

  public void setSortCriteria(String sortCriteria) {
    this.sortCriteria = sortCriteria;
  }


  public OppSearchResult() {
  }

  public class Opportunities {
    private Integer id;
    private String title;
    private String updated;
    private String status;

    public String getStatus() {
      return status;
    }

    public void setStatus(String status) {
      this.status = status;
    }

    public String getUpdated() {
      return updated;
    }

    public void setUpdated(String updated) {
      this.updated = updated;
    }

    public Integer getId() {
      return id;
    }

    public void setId(Integer id) {
      this.id = id;
    }

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

  }

}