import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ISectionUpgrades} from "../../../models/clicker/ISectionUpgrades";
import {IUpgrade} from "../../../models/clicker/IUpgrade";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {IAccount} from "../../../models/clicker/IAccount";
import {HttpService} from "../../../services/http.service";

@Component({
  selector: 'app-upgrades',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    NgIf
  ],
  templateUrl: './upgrades.component.html',
  styleUrl: './upgrades.component.scss'
})
export class UpgradesComponent implements OnInit {
  section: string = '';
  @Input({required: true}) account!: IAccount;
  @Output() accountUpdate: EventEmitter<IAccount> = new EventEmitter<IAccount>();

  private sectionUpgrades: ISectionUpgrades[] = [];
  sections: string[] = [];
  upgrades: IUpgrade[] = [];

  openedUpgrade: IUpgrade | null = null;

  constructor(
    private http: HttpService
  ) {}

  ngOnInit() {
    this.sectionUpgrades = this.account.sectionUpgrades;
    this.setImagesSrc();
    this.sectionUpgrades.forEach(su => this.sections.push(su.section));
    this.changeSection(this.sections[0]);
  }

  private setImagesSrc(): void {
    this.sectionUpgrades.forEach(su => {
      su.upgrades.forEach(u => u.imageSrc = this.getUpgradeImage(u));
    });
  }

  openModal(upgrade: IUpgrade): void {
    if (!upgrade.available || upgrade.maxLevel) return;
    this.openedUpgrade = upgrade;
  }

  buyUpgrade(upgrade: IUpgrade) {
    const body = {
      upgradeName: upgrade.name,
      upgradeLevel: upgrade.level
    }
    this.http.post('/v1/clicker/upgrades', body)
      .then(res => {
        this.account = res as IAccount;
        this.accountUpdate.emit(this.account);
        this.closeModal();
        this.sectionUpgrades = this.account.sectionUpgrades;
        this.setImagesSrc();
        this.changeSection(this.section);
      })
      .catch(err => {
        console.log(err);
      })
  }

  closeModal() {
    this.openedUpgrade = null;
  }

  changeSection(value: string) {
    this.section = value;
    this.upgrades = this.sectionUpgrades.find(su => su.section === value)!.upgrades;
  }

  getConditionText(upgrade: IUpgrade): string {
    return `${upgrade.condition?.upgradeName} lvl ${upgrade.condition?.level}`
  }

  getUpgradeImage(upgrade: IUpgrade) {
    return `upgrades/${upgrade.section}/${upgrade.name.replaceAll(' ', '')}.webp`;
  }
}
