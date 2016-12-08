import {Component, OnInit} from "@angular/core";
import {ApiServices} from "./api.services";
import {Node} from './node.class'
import {CheckStatus} from './checkstatus.enum'
import {Params, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'test-nodes',
  templateUrl: 'app/test.component.html'
})

export class TestComponent implements OnInit {
  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      let id = +params['id'];
      this.id = id
    });
  }

  id
  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {}
}